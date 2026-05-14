#!/bin/bash
# ============================================================
# Move to AI — Mise à jour zero-downtime
# Usage : bash scripts/server/update.sh [--branch main] [--skip-backup] [--skip-seed]
#
# Le script :
#   1. Vérifie l'espace disque et l'état de l'app
#   2. Sauvegarde le code et la BDD
#   3. Pull le code depuis Git
#   4. Installe les dépendances (npm ci)
#   5. Applique les migrations Prisma
#   6. Build Next.js
#   7. PM2 reload zero-downtime (cluster)
#   8. Vérifie le health check — rollback si échec
# ============================================================

set -euo pipefail

APP_USER="movetoai"
APP_DIR="/opt/movetoai/app"
BACKUP_DIR="/opt/movetoai/backups"
LOG_DIR="/opt/movetoai/logs"
LOG_FILE="${LOG_DIR}/update-$(date +%Y%m%d-%H%M%S).log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${GREEN}[✓]${RESET} $1" | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}[⚠]${RESET} $1" | tee -a "$LOG_FILE"; }
error()   { echo -e "${RED}[✗]${RESET} $1" | tee -a "$LOG_FILE"; rollback; exit 1; }
info()    { echo -e "${BLUE}[→]${RESET} $1" | tee -a "$LOG_FILE"; }
section() { echo -e "\n${BLUE}${BOLD}━━━ $1 ━━━${RESET}\n" | tee -a "$LOG_FILE"; }

BRANCH="main"
SKIP_BACKUP=false
SKIP_SEED=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --branch)      BRANCH="$2";      shift 2 ;;
    --skip-backup) SKIP_BACKUP=true; shift ;;
    --skip-seed)   SKIP_SEED=true;   shift ;;
    *) warn "Paramètre inconnu: $1"; shift ;;
  esac
done

mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CURRENT_COMMIT=$(cd "$APP_DIR" && sudo -u "$APP_USER" git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BACKUP_PATH="$BACKUP_DIR/backup-$TIMESTAMP"
START_TIME=$SECONDS

echo "" | tee -a "$LOG_FILE"
echo -e "${BLUE}${BOLD}━━━ Move to AI — Mise à jour zero-downtime ━━━${RESET}" | tee -a "$LOG_FILE"
echo -e "  Branche      : $BRANCH" | tee -a "$LOG_FILE"
echo -e "  Commit actuel: $CURRENT_COMMIT" | tee -a "$LOG_FILE"
echo -e "  Log          : $LOG_FILE" | tee -a "$LOG_FILE"
echo -e "  Date         : $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ── Fonction de rollback ───────────────────────────────────
rollback() {
  echo "" | tee -a "$LOG_FILE"
  warn "━━━ ROLLBACK EN COURS — commit cible: $CURRENT_COMMIT ━━━"

  # Restaurer le code
  if [[ -d "$BACKUP_PATH/app" ]]; then
    info "Restauration du code depuis la sauvegarde..."
    rsync -a --delete "$BACKUP_PATH/app/" "$APP_DIR/"
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    log "Code restauré"
  fi

  # Restaurer la base de données
  if [[ -f "$BACKUP_PATH/db.sql.gz" ]]; then
    info "Restauration de la base de données..."
    DB_PASS=$(grep "^DATABASE_URL=" "$APP_DIR/.env" | sed 's/.*:\([^:@]*\)@.*/\1/' || echo "")
    if [[ -n "$DB_PASS" ]]; then
      gunzip -c "$BACKUP_PATH/db.sql.gz" \
        | PGPASSWORD="$DB_PASS" psql -h localhost -U movetoai movetoai_prod \
        2>>"$LOG_FILE" \
        && log "Base de données restaurée" \
        || warn "Restauration DB échouée — intervention manuelle requise"
    else
      warn "Impossible d'extraire le mot de passe DB — restauration manuelle requise"
      warn "Backup disponible : $BACKUP_PATH/db.sql.gz"
    fi
  fi

  # Regenerer Prisma et redémarrer
  sudo -u "$APP_USER" bash -c "
    cd ${APP_DIR}
    npx prisma generate 2>/dev/null || true
    pm2 restart movetoai 2>/dev/null || true
  " || true

  warn "Rollback terminé — vérifier l'état de l'application"
  warn "  bash scripts/server/status.sh"
  warn "  sudo -u movetoai pm2 logs movetoai"
}

# ═══════════════════════════════════════════════════════════
section "1/7 — Vérifications pré-update"
# ═══════════════════════════════════════════════════════════

# Espace disque minimum requis (2GB)
DISK_FREE=$(df -BG "$APP_DIR" | tail -1 | awk '{print $4}' | tr -d 'G')
[[ $DISK_FREE -lt 2 ]] && error "Espace disque insuffisant (${DISK_FREE}GB < 2GB requis)"
log "Espace disque : ${DISK_FREE}GB libres ✓"

# Vérifier que Git est configuré
cd "$APP_DIR"
[[ ! -d .git ]] && error "Répertoire Git non trouvé dans $APP_DIR"
log "Dépôt Git détecté ✓"

# Vérifier l'état actuel de l'app
HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
if [[ "$HTTP_STATUS" == "200" ]]; then
  log "Application opérationnelle avant la mise à jour (HTTP $HTTP_STATUS)"
else
  warn "L'application ne répond pas (HTTP $HTTP_STATUS) — mise à jour forcée"
fi

# ═══════════════════════════════════════════════════════════
section "2/7 — Sauvegarde"
# ═══════════════════════════════════════════════════════════

if ! $SKIP_BACKUP; then
  mkdir -p "$BACKUP_PATH"

  # Sauvegarde du code (sans node_modules ni .next)
  info "Sauvegarde du code (commit $CURRENT_COMMIT)..."
  rsync -a \
    --exclude='.next' \
    --exclude='node_modules' \
    --exclude='.npm-cache' \
    "$APP_DIR/" "$BACKUP_PATH/app/"
  log "Code sauvegardé"

  # Dump PostgreSQL compressé
  info "Dump PostgreSQL en cours..."
  DB_PASS=$(grep "^DATABASE_URL=" "$APP_DIR/.env" | sed 's/.*:\([^:@]*\)@.*/\1/' || echo "")
  if [[ -n "$DB_PASS" ]]; then
    PGPASSWORD="$DB_PASS" pg_dump -h localhost -U movetoai movetoai_prod \
      | gzip > "$BACKUP_PATH/db.sql.gz"
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
    log "Base de données sauvegardée — total : $BACKUP_SIZE"
  else
    warn "Mot de passe DB non extrait — dump DB ignoré"
  fi

  # Purger les sauvegardes de plus de 7 jours
  find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
  log "Sauvegardes anciennes purgées (>7 jours)"
else
  warn "Sauvegarde ignorée (--skip-backup)"
fi

# ═══════════════════════════════════════════════════════════
section "3/7 — Récupération du code"
# ═══════════════════════════════════════════════════════════

cd "$APP_DIR"

# Protéger le .env avant le pull
cp .env .env.update-backup 2>/dev/null || true

info "git fetch origin/$BRANCH..."
sudo -u "$APP_USER" git fetch origin "$BRANCH" 2>>"$LOG_FILE"

NEW_COMMIT=$(sudo -u "$APP_USER" git rev-parse --short "origin/$BRANCH")
log "Nouveau commit : $NEW_COMMIT (actuel : $CURRENT_COMMIT)"

if [[ "$CURRENT_COMMIT" == "$NEW_COMMIT" && "${FORCE_UPDATE:-false}" != "true" ]]; then
  warn "Déjà à jour ($CURRENT_COMMIT). Forcer avec : FORCE_UPDATE=true bash scripts/server/update.sh"
  exit 0
fi

sudo -u "$APP_USER" git checkout "$BRANCH" 2>>"$LOG_FILE"
sudo -u "$APP_USER" git reset --hard "origin/$BRANCH" 2>>"$LOG_FILE"

# Restaurer le .env (il ne doit jamais être versionné)
if [[ -f .env.update-backup ]]; then
  cp .env.update-backup .env
  rm .env.update-backup
fi

log "Code mis à jour : $CURRENT_COMMIT → $NEW_COMMIT"

# ═══════════════════════════════════════════════════════════
section "4/7 — Installation des dépendances"
# ═══════════════════════════════════════════════════════════

info "npm ci (installation propre)..."
sudo -u "$APP_USER" npm ci --prefer-offline 2>>"$LOG_FILE" \
  || error "npm ci échoué — rollback"
log "Dépendances installées"

# ═══════════════════════════════════════════════════════════
section "5/7 — Schéma Prisma"
# ═══════════════════════════════════════════════════════════

info "npx prisma generate..."
sudo -u "$APP_USER" npx prisma generate 2>>"$LOG_FILE"
log "Prisma Client regénéré"

info "npx prisma db push..."
sudo -u "$APP_USER" npx prisma db push --accept-data-loss 2>>"$LOG_FILE" \
  || error "Prisma db push échoué — rollback"
log "Schéma appliqué"

# Seed des données de référence (idempotent)
if ! $SKIP_SEED; then
  info "Mise à jour du catalogue de certifications..."
  sudo -u "$APP_USER" node --env-file=.env prisma/seed-certifications.js 2>>"$LOG_FILE" \
    || warn "Seed certifications non bloquant — continuer"
  log "Catalogue mis à jour"
fi

# ═══════════════════════════════════════════════════════════
section "6/7 — Build Next.js"
# ═══════════════════════════════════════════════════════════

info "npm run build..."
sudo -u "$APP_USER" npm run build 2>>"$LOG_FILE" \
  || error "Build échoué — rollback"
log "Build terminé"

# ═══════════════════════════════════════════════════════════
section "7/7 — Rechargement zero-downtime (PM2 cluster)"
# ═══════════════════════════════════════════════════════════

info "pm2 reload movetoai (zero-downtime)..."
# En mode cluster, PM2 redémarre les instances une par une →
# le trafic continue d'être servi pendant le reload
sudo -u "$APP_USER" pm2 reload movetoai --update-env 2>>"$LOG_FILE" \
  || { sudo -u "$APP_USER" pm2 restart movetoai; }

sudo -u "$APP_USER" pm2 restart movetoai-cron 2>>"$LOG_FILE" || true
log "Application rechargée"

# Health check post-update
info "Vérification post-update..."
HTTP_STATUS="000"
for i in {1..20}; do
  HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
  [[ "$HTTP_STATUS" == "200" ]] && break
  sleep 2
done

if [[ "$HTTP_STATUS" != "200" ]]; then
  error "Health check échoué après mise à jour (HTTP $HTTP_STATUS) — rollback automatique"
fi

log "Health check OK (HTTP $HTTP_STATUS)"

DURATION=$(( SECONDS - START_TIME ))

# ── Résumé final ───────────────────────────────────────────
echo "" | tee -a "$LOG_FILE"
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}" | tee -a "$LOG_FILE"
echo -e "${GREEN}${BOLD}║  Mise à jour terminée avec succès !                 ║${RESET}" | tee -a "$LOG_FILE"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo -e "  Commit  : $CURRENT_COMMIT → $NEW_COMMIT" | tee -a "$LOG_FILE"
echo -e "  Durée   : $((DURATION / 60))m $((DURATION % 60))s" | tee -a "$LOG_FILE"
echo -e "  Backup  : $BACKUP_PATH" | tee -a "$LOG_FILE"
echo -e "  Log     : $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
