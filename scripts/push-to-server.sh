#!/usr/bin/env bash
# =============================================================================
# BluePilot AI — Copie des fichiers dev → serveur + déploiement
#
# Usage (depuis votre machine de dev) :
#   MOVETOAI_HOST=user@1.2.3.4 ./scripts/push-to-server.sh
#
# Variables :
#   MOVETOAI_HOST   = user@ip   (obligatoire)
#   MOVETOAI_PATH   = chemin sur le serveur (défaut: /opt/movetoai)
#   MOVETOAI_SSHKEY = clé SSH   (défaut: ~/.ssh/id_rsa)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${CYAN}[→]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }

HOST="${MOVETOAI_HOST:?Définissez MOVETOAI_HOST=user@ip}"
REMOTE_PATH="${MOVETOAI_PATH:-/opt/movetoai}"
SSH_KEY="${MOVETOAI_SSHKEY:-$HOME/.ssh/id_rsa}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_DIR="$(dirname "$SCRIPT_DIR")"

SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   BluePilot AI — Push vers le serveur    ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""
log "Source  : $LOCAL_DIR"
log "Cible   : $HOST:$REMOTE_PATH"
echo ""

log "Transfert des fichiers (rsync)…"

rsync -avz --progress \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.production' \
  --exclude='.deploy-state/' \
  --exclude='*.log' \
  --exclude='uploads/' \
  --exclude='.DS_Store' \
  --exclude='Thumbs.db' \
  -e "ssh $SSH_OPTS" \
  "$LOCAL_DIR/" \
  "$HOST:$REMOTE_PATH/"

ok "Fichiers transférés"

log "Lancement du déploiement sur le serveur…"

# shellcheck disable=SC2087
ssh $SSH_OPTS "$HOST" bash <<REMOTE
  set -e
  sudo bash "${REMOTE_PATH}/scripts/deploy.sh"
REMOTE

ok "Déploiement terminé"
echo ""
echo -e "${BOLD}${GREEN}✓ Push et déploiement réussis !${NC}"
echo ""
