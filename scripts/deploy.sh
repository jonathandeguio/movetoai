#!/usr/bin/env bash
# =============================================================================
# BluePilot AI — Script de déploiement post-copie
#
# Usage APRÈS avoir copié les fichiers de dev vers le serveur :
#
#   # Côté dev — copier les fichiers (exemple avec rsync)
#   rsync -avz --exclude node_modules --exclude .next --exclude .env \
#         ./ user@serveur:/opt/movetoai/
#
#   # Côté serveur — lancer ce script
#   chmod +x /opt/movetoai/scripts/deploy.sh
#   sudo /opt/movetoai/scripts/deploy.sh
#
# Ce que le script fait :
#   1. Détecte si le schéma Prisma a changé (SHA-256)
#   2. npm ci  (si package-lock.json changé)
#   3. prisma generate
#   4. Snapshot DB + prisma db push  (si schéma changé)
#   5. next build
#   6. Redémarrage du service + health-check HTTP
# =============================================================================

set -euo pipefail
IFS=$'\n\t'

# ── Couleurs ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()   { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $*"; }
ok()    { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✓${NC} $*"; }
warn()  { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠${NC} $*"; }
die()   { echo -e "${RED}[$(date '+%H:%M:%S')] ✗ ERREUR${NC} $*" >&2; exit 1; }
step()  { echo ""; echo -e "${BOLD}── $* ──────────────────────────────────────────${NC}"; }

# ── Config ────────────────────────────────────────────────────────────────────
[[ "$EUID" -ne 0 ]] && die "Exécuter avec sudo"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
APP_USER="${MOVETOAI_USER:-movetoai}"
SERVICE="movetoai.service"
ENV_FILE="${APP_DIR}/.env"
STATE_DIR="${APP_DIR}/.deploy-state"
BACKUP_DIR="/var/backups/movetoai"
LOG_FILE="/var/log/movetoai-deploy.log"

mkdir -p "$STATE_DIR" "$BACKUP_DIR"

# Redirige toute la sortie vers le log + terminal
exec > >(tee -a "$LOG_FILE") 2>&1

echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║    BluePilot AI — Déploiement post-copie      ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════╝${NC}"
log "Répertoire : $APP_DIR"
log "Utilisateur: $APP_USER"
log "Service    : $SERVICE"
log "Log complet: $LOG_FILE"

# =============================================================================
# 0. VÉRIFICATIONS PRÉALABLES
# =============================================================================
step "0. Vérifications"

[[ -f "$ENV_FILE" ]]                     || die ".env introuvable — copiez votre .env en production avant de lancer ce script"
[[ -f "$APP_DIR/prisma/schema.prisma" ]] || die "prisma/schema.prisma introuvable"
[[ -f "$APP_DIR/package.json" ]]         || die "package.json introuvable"
[[ -f "$APP_DIR/package-lock.json" ]]    || die "package-lock.json introuvable"
id "$APP_USER" &>/dev/null               || die "Utilisateur $APP_USER inexistant — lancez install.sh d'abord"
command -v mysqldump &>/dev/null         || die "mysqldump introuvable — installez mysql-client"

# Charge le .env pour extraire DATABASE_URL
set -a
# shellcheck disable=SC1090
source <(grep -v '^#' "$ENV_FILE" | grep -v '^\s*$' | grep -E '^[A-Z_]+=')
set +a

[[ -n "${DATABASE_URL:-}" ]] || die "DATABASE_URL absent dans .env"
ok "Pré-requis OK"

# =============================================================================
# 1. DÉTECTION DES CHANGEMENTS PAR HASH SHA-256
# =============================================================================
step "1. Détection des changements"

SCHEMA_FILE="$APP_DIR/prisma/schema.prisma"
SCHEMA_HASH_FILE="$STATE_DIR/schema.sha256"
PKG_LOCK_FILE="$APP_DIR/package-lock.json"
PKG_LOCK_HASH_FILE="$STATE_DIR/package-lock.sha256"

SCHEMA_HASH_NOW=$(sha256sum "$SCHEMA_FILE" | awk '{print $1}')
SCHEMA_HASH_PREV=$(cat "$SCHEMA_HASH_FILE" 2>/dev/null || echo "none")

PKG_HASH_NOW=$(sha256sum "$PKG_LOCK_FILE" | awk '{print $1}')
PKG_HASH_PREV=$(cat "$PKG_LOCK_HASH_FILE" 2>/dev/null || echo "none")

SCHEMA_CHANGED=false
PKG_CHANGED=false

if [[ "$SCHEMA_HASH_NOW" != "$SCHEMA_HASH_PREV" ]]; then
  SCHEMA_CHANGED=true
  warn "prisma/schema.prisma modifié → migration DB requise"
else
  ok "Schema Prisma inchangé — pas de migration"
fi

if [[ "$PKG_HASH_NOW" != "$PKG_HASH_PREV" ]]; then
  PKG_CHANGED=true
  warn "package-lock.json modifié → npm ci requis"
else
  ok "package-lock.json inchangé — npm ci ignoré"
fi

# =============================================================================
# 2. NPM CI (seulement si package-lock changé ou node_modules absent)
# =============================================================================
step "2. Dépendances npm"

if [[ "$PKG_CHANGED" == true ]] || [[ ! -d "$APP_DIR/node_modules" ]]; then
  log "npm ci en cours…"
  sudo -u "$APP_USER" bash -c "
    cd '$APP_DIR'
    npm ci --prefer-offline --no-audit --no-fund 2>&1
  "
  # Stripe si absent
  if ! sudo -u "$APP_USER" node -e "require('stripe')" &>/dev/null 2>&1; then
    log "Installation de stripe…"
    sudo -u "$APP_USER" bash -c "
      cd '$APP_DIR'
      npm install stripe @stripe/stripe-js --no-audit --no-fund --silent
    "
  fi
  echo "$PKG_HASH_NOW" > "$PKG_LOCK_HASH_FILE"
  ok "Dépendances npm à jour"
else
  ok "node_modules OK — npm ci ignoré"
fi

# =============================================================================
# 3. PRISMA GENERATE (toujours)
# =============================================================================
step "3. Génération du client Prisma"

log "npx prisma generate…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npx prisma generate 2>&1"
ok "Client Prisma généré"

# =============================================================================
# 4. MIGRATION BASE DE DONNÉES (seulement si schéma changé)
# =============================================================================
step "4. Migration de la base de données"

if [[ "$SCHEMA_CHANGED" == true ]]; then

  # ── Parsing de DATABASE_URL ─────────────────────────────────────────────────
  # Format : mysql://user:pass@host:port/dbname
  DB_USER_V=$(echo "$DATABASE_URL" | sed -E 's|mysql://([^:]+):.*|\1|')
  DB_PASS_V=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^:]+:([^@]+)@.*|\1|')
  DB_HOST_V=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^@]+@([^:/]+).*|\1|')
  DB_PORT_V=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^@]+@[^:]+:([0-9]+)/.*|\1|')
  DB_NAME_V=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^/]+/([^?]+).*|\1|')

  # ── Snapshot avant migration ────────────────────────────────────────────────
  SNAP_FILE="${BACKUP_DIR}/pre-deploy_$(date +%Y%m%d_%H%M%S).sql.gz"
  log "Snapshot de la DB '$DB_NAME_V' avant migration → $SNAP_FILE"

  mysqldump \
    --host="$DB_HOST_V" \
    --port="$DB_PORT_V" \
    --user="$DB_USER_V" \
    --password="$DB_PASS_V" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    "$DB_NAME_V" \
    | gzip -9 > "$SNAP_FILE"

  SNAP_SIZE=$(du -sh "$SNAP_FILE" | cut -f1)
  ok "Snapshot créé : $SNAP_FILE ($SNAP_SIZE)"

  # ── Dry-run — aperçu des changements ───────────────────────────────────────
  log "Analyse des changements de schéma (dry-run)…"
  sudo -u "$APP_USER" bash -c "
    cd '$APP_DIR'
    npx prisma db push --dry-run --skip-generate 2>&1 || true
  " | grep -E "^\s+(→|✓|✗|·|–|Added|Removed|Changed|Renamed|create|drop|alter)" || true

  # ── Application du schéma ───────────────────────────────────────────────────
  log "Application du schéma → prisma db push…"
  sudo -u "$APP_USER" bash -c "
    cd '$APP_DIR'
    npx prisma db push --skip-generate --accept-data-loss 2>&1
  "

  # Sauvegarde du hash une fois la migration réussie
  echo "$SCHEMA_HASH_NOW" > "$SCHEMA_HASH_FILE"
  ok "Schéma DB mis à jour"

  warn "Rollback si besoin :"
  warn "  gunzip -c '$SNAP_FILE' | mysql -u $DB_USER_V -p'<pass>' $DB_NAME_V"

else
  ok "Schéma DB inchangé — aucune migration"
fi

# =============================================================================
# 5. BUILD NEXT.JS
# =============================================================================
step "5. Build Next.js"

log "next build en cours (1-3 min)…"
BUILD_START=$(date +%s)

sudo -u "$APP_USER" bash -c "
  cd '$APP_DIR'
  npm run build 2>&1
"

BUILD_END=$(date +%s)
BUILD_SECS=$(( BUILD_END - BUILD_START ))
ok "Build terminé en ${BUILD_SECS}s"

# =============================================================================
# 6. REDÉMARRAGE DU SERVICE + HEALTH CHECK
# =============================================================================
step "6. Redémarrage du service"

APP_PORT="${PORT:-3000}"

# Vérifier que le service existe
systemctl cat "$SERVICE" &>/dev/null || die "Service $SERVICE introuvable — lancez install.sh d'abord"

log "systemctl restart $SERVICE…"
systemctl restart "$SERVICE"

# Health check avec retry (60s max)
MAX_RETRIES=12
RETRY_INTERVAL=5
HEALTHY=false

log "Health check http://localhost:${APP_PORT} (max $((MAX_RETRIES * RETRY_INTERVAL))s)…"
for i in $(seq 1 "$MAX_RETRIES"); do
  sleep "$RETRY_INTERVAL"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://localhost:${APP_PORT}" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" =~ ^(200|301|302|307|308)$ ]]; then
    HEALTHY=true
    ok "Service OK (HTTP $HTTP_CODE) — démarré en $((i * RETRY_INTERVAL))s"
    break
  else
    log "  Tentative $i/$MAX_RETRIES — HTTP $HTTP_CODE…"
  fi
done

if [[ "$HEALTHY" == false ]]; then
  die "Le service ne répond pas après $((MAX_RETRIES * RETRY_INTERVAL))s.
Diagnostic : sudo journalctl -u $SERVICE -n 100 --no-pager"
fi

# =============================================================================
# RÉSUMÉ FINAL
# =============================================================================
echo ""
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  ✓ Déploiement BluePilot AI terminé avec succès  ${NC}"
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Schéma Prisma migré   : $(
  [[ "$SCHEMA_CHANGED" == true ]] \
    && echo -e "${GREEN}OUI${NC}" \
    || echo "non")"
echo -e "  Dépendances npm       : $(
  [[ "$PKG_CHANGED" == true ]] \
    && echo -e "${GREEN}npm ci effectué${NC}" \
    || echo "inchangées")"
echo -e "  Durée du build        : ${BUILD_SECS}s"
echo -e "  Log complet           : $LOG_FILE"
echo ""
echo -e "  ${CYAN}sudo systemctl status $SERVICE${NC}"
echo -e "  ${CYAN}sudo journalctl -u $SERVICE -f${NC}"
echo ""
