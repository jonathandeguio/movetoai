#!/bin/bash
# ============================================================
# Move to AI — Démarrage de tous les services
# Usage : bash scripts/server/start.sh [--check-only]
# ============================================================

set -euo pipefail

APP_USER="movetoai"
APP_DIR="/opt/movetoai/app"
TIMEOUT=30

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

log()   { echo -e "${GREEN}[✓]${RESET} $1"; }
warn()  { echo -e "${YELLOW}[⚠]${RESET} $1"; }
error() { echo -e "${RED}[✗]${RESET} $1"; }
info()  { echo -e "${BLUE}[→]${RESET} $1"; }

CHECK_ONLY=false
[[ "${1:-}" == "--check-only" ]] && CHECK_ONLY=true

echo ""
echo -e "${BLUE}${BOLD}━━━ Move to AI — Démarrage des services ━━━${RESET}"
echo -e "${BLUE}$(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo ""

# ── Fonction : attendre qu'un service soit prêt ────────────
wait_for_service() {
  local name="$1"
  local check_cmd="$2"
  local elapsed=0
  info "Attente de $name..."
  while ! eval "$check_cmd" &>/dev/null; do
    sleep 1
    elapsed=$((elapsed + 1))
    if [[ $elapsed -ge $TIMEOUT ]]; then
      error "$name non disponible après ${TIMEOUT}s"
      return 1
    fi
  done
  log "$name prêt (${elapsed}s)"
}

# ══════════════════════════════════════════════════════════
# 1. PostgreSQL
# ══════════════════════════════════════════════════════════
info "▶ PostgreSQL..."
if systemctl is-active --quiet postgresql; then
  log "PostgreSQL actif"
else
  if $CHECK_ONLY; then
    warn "PostgreSQL arrêté (mode check-only)"
  else
    systemctl start postgresql
    wait_for_service "PostgreSQL" "pg_isready -h localhost -U movetoai -d movetoai_prod"
    log "PostgreSQL démarré"
  fi
fi

if pg_isready -h localhost -U movetoai -d movetoai_prod &>/dev/null; then
  # Compter les connexions actives
  CONN_COUNT=$(sudo -u movetoai psql -h localhost -U movetoai movetoai_prod \
    -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='movetoai_prod';" \
    2>/dev/null | xargs || echo "?")
  log "PostgreSQL : connexion OK · ${CONN_COUNT} session(s) active(s)"
else
  error "PostgreSQL : impossible de se connecter à movetoai_prod"
fi

# ══════════════════════════════════════════════════════════
# 2. Redis
# ══════════════════════════════════════════════════════════
info "▶ Redis..."
if systemctl is-active --quiet redis-server; then
  log "Redis actif"
else
  if $CHECK_ONLY; then
    warn "Redis arrêté (mode check-only)"
  else
    systemctl start redis-server
    wait_for_service "Redis" "redis-cli ping"
    log "Redis démarré"
  fi
fi

REDIS_PING=$(redis-cli ping 2>/dev/null || echo "FAIL")
if [[ "$REDIS_PING" == "PONG" ]]; then
  REDIS_MEM=$(redis-cli info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d $'\r' || echo "?")
  log "Redis : ping OK · mémoire ${REDIS_MEM}"
else
  warn "Redis : ping échoué (vérifier le mot de passe dans .env)"
fi

# ══════════════════════════════════════════════════════════
# 3. Ollama (si installé)
# ══════════════════════════════════════════════════════════
if systemctl list-unit-files 2>/dev/null | grep -q ollama.service; then
  info "▶ Ollama..."
  if systemctl is-active --quiet ollama; then
    log "Ollama actif"
  else
    if $CHECK_ONLY; then
      warn "Ollama arrêté (mode check-only)"
    else
      systemctl start ollama
      wait_for_service "Ollama" "curl -sf http://localhost:11434/api/tags"
      log "Ollama démarré"
    fi
  fi
  MODELS_COUNT=$(ollama list 2>/dev/null | tail -n +2 | wc -l || echo "0")
  log "Ollama : ${MODELS_COUNT} modèle(s) chargé(s)"
fi

# ══════════════════════════════════════════════════════════
# 4. Application Next.js via PM2
# ══════════════════════════════════════════════════════════
info "▶ Application Move to AI (PM2)..."

APP_PM2_STATUS=$(sudo -u "$APP_USER" pm2 describe movetoai 2>/dev/null \
  | grep -E "^\│\s+status" | awk '{print $NF}' | tr -d '│' | xargs || echo "offline")

if [[ "$APP_PM2_STATUS" == "online" ]]; then
  log "Application déjà en ligne (PM2)"
else
  if $CHECK_ONLY; then
    warn "Application arrêtée dans PM2 (status: $APP_PM2_STATUS)"
  else
    if sudo -u "$APP_USER" pm2 describe movetoai &>/dev/null 2>&1; then
      sudo -u "$APP_USER" pm2 start movetoai
    else
      sudo -u "$APP_USER" pm2 start "$APP_DIR/ecosystem.config.js" --env production
      sudo -u "$APP_USER" pm2 save
    fi
    log "Application démarrée"
  fi
fi

# Health check avec retry
info "Health check /api/health..."
HTTP_STATUS="000"
for i in {1..15}; do
  HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
  if [[ "$HTTP_STATUS" == "200" ]]; then
    log "Health check OK (HTTP $HTTP_STATUS)"
    break
  fi
  sleep 2
done

if [[ "$HTTP_STATUS" != "200" ]]; then
  warn "Health check échoué (HTTP $HTTP_STATUS) — vérifier les logs : sudo -u movetoai pm2 logs movetoai"
fi

# ══════════════════════════════════════════════════════════
# 5. Nginx
# ══════════════════════════════════════════════════════════
info "▶ Nginx..."
if systemctl is-active --quiet nginx; then
  log "Nginx actif"
else
  if $CHECK_ONLY; then
    warn "Nginx arrêté (mode check-only)"
  else
    nginx -t 2>/dev/null && systemctl start nginx
    log "Nginx démarré"
  fi
fi

# ══════════════════════════════════════════════════════════
# Résumé
# ══════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}━━━ État des services ━━━${RESET}"

status_icon() {
  systemctl is-active --quiet "$1" 2>/dev/null \
    && echo -e "${GREEN}●${RESET} actif" \
    || echo -e "${RED}○${RESET} arrêté"
}

printf "  %-22s %s\n" "PostgreSQL"      "$(status_icon postgresql)"
printf "  %-22s %s\n" "Redis"           "$(status_icon redis-server)"
printf "  %-22s %s\n" "Nginx"           "$(status_icon nginx)"

if systemctl list-unit-files 2>/dev/null | grep -q ollama.service; then
  printf "  %-22s %s\n" "Ollama"        "$(status_icon ollama)"
fi

PM2_STATUS=$(sudo -u "$APP_USER" pm2 describe movetoai 2>/dev/null \
  | grep -E "^\│\s+status" | awk '{print $NF}' | tr -d '│' | xargs || echo "inconnu")
if [[ "$PM2_STATUS" == "online" ]]; then
  printf "  %-22s ${GREEN}● %s${RESET}\n" "Move to AI (PM2)" "$PM2_STATUS"
else
  printf "  %-22s ${RED}○ %s${RESET}\n" "Move to AI (PM2)" "$PM2_STATUS"
fi

echo ""
