#!/usr/bin/env bash
# =============================================================================
# BluePilot AI — Script de mise à jour (zero-downtime)
# Usage:
#   sudo ./scripts/update.sh
# =============================================================================

set -euo pipefail
IFS=$'\n\t'

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()   { echo -e "${GREEN}[OK]${NC}    $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

[[ "$EUID" -ne 0 ]] && die "Exécuter avec sudo"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
APP_USER="${MOVETOAI_USER:-movetoai}"
SERVICE="movetoai.service"

echo ""
echo -e "${BOLD}╔══════════════════════════════════╗${NC}"
echo -e "${BOLD}║   BluePilot AI — Mise à jour     ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════╝${NC}"
echo ""

log "git pull…"
sudo -u "$APP_USER" git -C "$APP_DIR" pull --ff-only
ok "Code mis à jour"

log "npm ci…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npm ci --prefer-offline --no-audit --no-fund --silent 2>&1 | tail -3"
ok "Dépendances à jour"

log "prisma generate…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npx prisma generate --silent 2>&1 | tail -3"
ok "Client Prisma généré"

log "prisma db push…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npx prisma db push --skip-generate 2>&1 | tail -5"
ok "Schéma DB à jour"

log "next build…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npm run build 2>&1 | tail -20"
ok "Build terminé"

log "Redémarrage de $SERVICE…"
systemctl restart "$SERVICE"
sleep 2
systemctl is-active --quiet "$SERVICE" \
  && ok "Service $SERVICE redémarré avec succès" \
  || die "Le service n'a pas démarré — vérifiez : journalctl -u $SERVICE -n 50"

echo ""
echo -e "${BOLD}${GREEN}✓ Mise à jour terminée !${NC}"
echo -e "  Logs : ${CYAN}sudo journalctl -u $SERVICE -f${NC}"
echo ""
