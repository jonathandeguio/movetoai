#!/bin/bash
# ============================================================
# Move to AI — Arrêt propre de tous les services
# Usage : bash scripts/server/stop.sh [--all] [--force]
#   --all   : arrête aussi PostgreSQL, Redis et Ollama
#   --force : pas de confirmation interactive
# ============================================================

set -euo pipefail

APP_USER="movetoai"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'
BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${GREEN}[✓]${RESET} $1"; }
warn() { echo -e "${YELLOW}[⚠]${RESET} $1"; }
info() { echo -e "${BLUE}[→]${RESET} $1"; }

STOP_ALL=false
FORCE=false
for arg in "$@"; do
  [[ "$arg" == "--all"   ]] && STOP_ALL=true
  [[ "$arg" == "--force" ]] && FORCE=true
done

echo ""
echo -e "${BOLD}━━━ Move to AI — Arrêt des services ━━━${RESET}"
echo ""

# Confirmation interactive (sauf si --force)
if ! $FORCE; then
  if $STOP_ALL; then
    read -p "Arrêter TOUS les services (app + PostgreSQL + Redis + Nginx) ? [y/N] " -n 1 -r
  else
    read -p "Arrêter l'application et Nginx ? (PostgreSQL/Redis restent actifs) [y/N] " -n 1 -r
  fi
  echo ""
  [[ ! $REPLY =~ ^[Yy]$ ]] && { echo "Annulé."; exit 0; }
fi

# ══════════════════════════════════════════════════════════
# 1. Application Next.js (PM2 graceful shutdown)
# ══════════════════════════════════════════════════════════
info "Arrêt de l'application Move to AI (graceful)..."

if sudo -u "$APP_USER" pm2 describe movetoai &>/dev/null 2>&1; then
  # PM2 envoie SIGINT → Next.js attend la fin des requêtes en cours
  sudo -u "$APP_USER" pm2 stop movetoai --wait-ready 2>/dev/null \
    || sudo -u "$APP_USER" pm2 stop movetoai
  log "Application arrêtée"
else
  warn "movetoai non trouvé dans PM2"
fi

if sudo -u "$APP_USER" pm2 describe movetoai-cron &>/dev/null 2>&1; then
  sudo -u "$APP_USER" pm2 stop movetoai-cron 2>/dev/null || true
  log "Worker cron arrêté"
fi

# ══════════════════════════════════════════════════════════
# 2. Nginx
# ══════════════════════════════════════════════════════════
info "Arrêt Nginx..."
if systemctl is-active --quiet nginx; then
  systemctl stop nginx
  log "Nginx arrêté"
else
  warn "Nginx déjà arrêté"
fi

# ══════════════════════════════════════════════════════════
# 3. Ollama (si installé et --all)
# ══════════════════════════════════════════════════════════
if $STOP_ALL && systemctl list-unit-files 2>/dev/null | grep -q ollama.service; then
  info "Arrêt Ollama..."
  if systemctl is-active --quiet ollama; then
    systemctl stop ollama
    log "Ollama arrêté"
  else
    warn "Ollama déjà arrêté"
  fi
fi

# ══════════════════════════════════════════════════════════
# 4. Redis (--all uniquement — sauvegarde automatique)
# ══════════════════════════════════════════════════════════
if $STOP_ALL; then
  info "Arrêt Redis (BGSAVE avant arrêt)..."
  if systemctl is-active --quiet redis-server; then
    # redis-cli shutdown save déclenche une sauvegarde RDB puis arrête proprement
    redis-cli shutdown save 2>/dev/null \
      || systemctl stop redis-server
    log "Redis arrêté (données sauvegardées)"
  else
    warn "Redis déjà arrêté"
  fi
fi

# ══════════════════════════════════════════════════════════
# 5. PostgreSQL (--all uniquement — "fast" shutdown)
# ══════════════════════════════════════════════════════════
if $STOP_ALL; then
  info "Arrêt PostgreSQL (fast shutdown — fin des transactions en cours)..."
  if systemctl is-active --quiet postgresql; then
    systemctl stop postgresql
    log "PostgreSQL arrêté"
  else
    warn "PostgreSQL déjà arrêté"
  fi
fi

# ══════════════════════════════════════════════════════════
# Résumé
# ══════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}━━━ État après arrêt ━━━${RESET}"

status_icon() {
  systemctl is-active --quiet "$1" 2>/dev/null \
    && echo -e "\033[0;32m● actif\033[0m" \
    || echo -e "\033[2m○ arrêté\033[0m"
}

printf "  %-22s %s\n" "PostgreSQL"      "$(status_icon postgresql)"
printf "  %-22s %s\n" "Redis"           "$(status_icon redis-server)"
printf "  %-22s %s\n" "Nginx"           "$(status_icon nginx)"

if systemctl list-unit-files 2>/dev/null | grep -q ollama.service; then
  printf "  %-22s %s\n" "Ollama"        "$(status_icon ollama)"
fi

PM2_STATUS=$(sudo -u "$APP_USER" pm2 describe movetoai 2>/dev/null \
  | grep -E "^\│\s+status" | awk '{print $NF}' | tr -d '│' | xargs || echo "inconnu")
printf "  %-22s \033[2m○ %s\033[0m\n" "Move to AI (PM2)" "$PM2_STATUS"

echo ""

if $STOP_ALL; then
  log "Arrêt complet — tous les services arrêtés"
else
  log "Arrêt partiel — PostgreSQL et Redis toujours actifs"
  echo -e "  Pour un arrêt complet : ${BOLD}bash scripts/server/stop.sh --all${RESET}"
fi
echo ""
