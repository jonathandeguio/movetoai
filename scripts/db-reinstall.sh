#!/bin/bash
# ============================================================
# BluePilot AI — Suppression et réinstallation de la base
#
# Usage :
#   bash scripts/db-reinstall.sh
#   bash scripts/db-reinstall.sh --force        # sans confirmation
#   bash scripts/db-reinstall.sh --skip-seed    # sans les seeds
#   bash scripts/db-reinstall.sh --keep-user    # recrée uniquement la DB
#
# ⚠  TOUTES LES DONNÉES SERONT PERDUES DÉFINITIVEMENT ⚠
# ============================================================

set -euo pipefail

# ── Couleurs ──────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${GREEN}[✓]${RESET} $1"; }
warn()    { echo -e "${YELLOW}[⚠]${RESET} $1"; }
error()   { echo -e "${RED}[✗]${RESET} $1"; exit 1; }
section() { echo -e "\n${BOLD}━━━ $1 ━━━${RESET}"; }

# ── Valeurs par défaut ────────────────────────────────────────
DB_NAME="movetoai"
DB_USER="movetoai"
DB_HOST="localhost"
DB_PORT="3306"
DB_PASS=""
MYSQL_ROOT_USER="root"
FORCE=false
SKIP_SEED=false
KEEP_USER=false
ENV_FILE=".env"

# ── Arguments ─────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --db)            DB_NAME="$2";         shift 2 ;;
    --user)          DB_USER="$2";         shift 2 ;;
    --host)          DB_HOST="$2";         shift 2 ;;
    --port)          DB_PORT="$2";         shift 2 ;;
    --password)      DB_PASS="$2";         shift 2 ;;
    --root-user)     MYSQL_ROOT_USER="$2"; shift 2 ;;
    --force)         FORCE=true;           shift ;;
    --skip-seed)     SKIP_SEED=true;       shift ;;
    --keep-user)     KEEP_USER=true;       shift ;;
    --env)           ENV_FILE="$2";        shift 2 ;;
    *) warn "Paramètre inconnu : $1"; shift ;;
  esac
done

# ── Lire le mot de passe depuis .env si non fourni ────────────
if [[ -z "$DB_PASS" ]] && [[ -f "$ENV_FILE" ]]; then
  EXISTING_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' || true)
  if [[ -n "$EXISTING_URL" ]]; then
    DB_PASS=$(echo "$EXISTING_URL" | sed 's|mysql://[^:]*:\([^@]*\)@.*|\1|')
    DB_HOST=$(echo "$EXISTING_URL" | sed 's|.*@\([^:]*\):.*|\1|')
    DB_PORT=$(echo "$EXISTING_URL" | sed 's|.*:\([0-9]*\)/.*|\1|')
    DB_NAME=$(echo "$EXISTING_URL" | sed 's|.*/\([^?]*\).*|\1|')
  fi
fi

# Générer un nouveau mot de passe si toujours vide
if [[ -z "$DB_PASS" ]]; then
  DB_PASS=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
  warn "Nouveau mot de passe généré automatiquement"
fi

DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# ══════════════════════════════════════════════════════════════
echo ""
echo -e "${RED}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${RED}${BOLD}║   ⚠  SUPPRESSION TOTALE DE LA BASE DE DONNÉES  ⚠   ║${RESET}"
echo -e "${RED}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Base     : ${BOLD}${DB_NAME}${RESET}"
echo -e "  Hôte     : ${DB_HOST}:${DB_PORT}"
echo -e "  Action   : DROP DATABASE + CREATE + prisma db push + seeds"
echo ""
echo -e "  ${RED}${BOLD}TOUTES LES DONNÉES SERONT PERDUES DÉFINITIVEMENT.${RESET}"
echo ""

# ── Confirmation ──────────────────────────────────────────────
if ! $FORCE; then
  read -rp "  Tapez le nom de la base pour confirmer (${DB_NAME}) : " CONFIRM
  [[ "$CONFIRM" == "$DB_NAME" ]] || { echo "Annulé."; exit 0; }
  echo ""
fi

# ══════════════════════════════════════════════════════════
section "1/5 — Vérifications préalables"
# ══════════════════════════════════════════════════════════

command -v mysql >/dev/null 2>&1 || error "mysql client introuvable"
command -v node  >/dev/null 2>&1 || error "node introuvable"
command -v npx   >/dev/null 2>&1 || error "npx introuvable"
[[ -f "prisma/schema.prisma" ]]  || error "prisma/schema.prisma introuvable — lancer depuis la racine"

log "Prérequis OK"

# ── Mot de passe root MySQL ───────────────────────────────────
read -rsp "Mot de passe MySQL root : " MYSQL_ROOT_PASS
echo ""

run_mysql() {
  mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -h"$DB_HOST" -P"$DB_PORT" "$@"
}

# Test connexion root
run_mysql -e "SELECT 1;" >/dev/null 2>&1 \
  || error "Impossible de se connecter à MySQL (vérifiez le mot de passe root)"

log "Connexion MySQL root OK"

# ══════════════════════════════════════════════════════════
section "2/5 — Suppression base & utilisateur"
# ══════════════════════════════════════════════════════════

run_mysql <<SQL
-- Supprimer la base
DROP DATABASE IF EXISTS \`${DB_NAME}\`;
SQL
log "Base '${DB_NAME}' supprimée"

if ! $KEEP_USER; then
  run_mysql <<SQL
-- Supprimer l'utilisateur
DROP USER IF EXISTS '${DB_USER}'@'${DB_HOST}';
FLUSH PRIVILEGES;
SQL
  log "Utilisateur '${DB_USER}' supprimé"
else
  warn "Utilisateur conservé (--keep-user)"
fi

# ══════════════════════════════════════════════════════════
section "3/5 — Recréation base & utilisateur"
# ══════════════════════════════════════════════════════════

run_mysql <<SQL
-- Recréer la base
CREATE DATABASE \`${DB_NAME}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Recréer l'utilisateur (ou le conserver)
CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_HOST}'
  IDENTIFIED BY '${DB_PASS}';

-- Droits
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${DB_HOST}';

-- Si l'utilisateur existait déjà, mettre à jour son mot de passe
ALTER USER '${DB_USER}'@'${DB_HOST}'
  IDENTIFIED BY '${DB_PASS}';

FLUSH PRIVILEGES;
SQL

log "Base '${DB_NAME}' recréée"
log "Utilisateur '${DB_USER}' recréé avec le nouveau mot de passe"

# Mettre à jour .env
if [[ -f "$ENV_FILE" ]]; then
  if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" "$ENV_FILE"
  else
    echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "$ENV_FILE"
  fi
  log "DATABASE_URL mise à jour dans $ENV_FILE"
fi

# ══════════════════════════════════════════════════════════
section "4/5 — Schéma Prisma (db push)"
# ══════════════════════════════════════════════════════════

DATABASE_URL="$DATABASE_URL" npx prisma generate
log "Client Prisma régénéré"

DATABASE_URL="$DATABASE_URL" npx prisma db push --accept-data-loss
log "Schéma appliqué (toutes les tables recréées)"

# ══════════════════════════════════════════════════════════
section "5/5 — Seeds"
# ══════════════════════════════════════════════════════════

if $SKIP_SEED; then
  warn "Seeds ignorés (--skip-seed)"
else
  DATABASE_URL="$DATABASE_URL" node --env-file-if-exists="$ENV_FILE" prisma/seed.js \
    && log "Seed principal OK" \
    || warn "Seed principal échoué (non bloquant)"

  DATABASE_URL="$DATABASE_URL" node --env-file-if-exists="$ENV_FILE" prisma/seed-certifications.js \
    && log "Seed certifications OK" \
    || warn "Seed certifications échoué (non bloquant)"
fi

# ══════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}${BOLD}✅ Réinstallation terminée${RESET}"
echo ""
echo -e "  DATABASE_URL : ${DATABASE_URL}"
echo ""
echo -e "  ${YELLOW}⚠ Nouveau mot de passe DB :${RESET} ${BOLD}${DB_PASS}${RESET}"
echo ""
echo -e "  Prochaine étape : ${BOLD}npm run dev${RESET}"
echo ""
