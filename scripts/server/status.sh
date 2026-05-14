#!/bin/bash
# ============================================================
# Move to AI — État complet de tous les services
# Usage : bash scripts/server/status.sh [--json] [--watch]
#   --json  : sortie JSON (pour monitoring externe)
#   --watch : rafraîchissement automatique toutes les 5 secondes
# ============================================================

APP_USER="movetoai"
APP_DIR="/opt/movetoai/app"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'; DIM='\033[2m'

JSON_OUTPUT=false
WATCH_MODE=false
for arg in "$@"; do
  [[ "$arg" == "--json"  ]] && JSON_OUTPUT=true
  [[ "$arg" == "--watch" ]] && WATCH_MODE=true
done

# ── Fonctions helpers ──────────────────────────────────────
svc_active() { systemctl is-active --quiet "$1" 2>/dev/null; }
svc_icon()   { svc_active "$1" && echo -e "${GREEN}●${RESET}" || echo -e "${RED}○${RESET}"; }

run_checks() {

  # ── Sortie JSON ────────────────────────────────────────────
  if $JSON_OUTPUT; then
    PG_OK=$(pg_isready -h localhost -U movetoai -d movetoai_prod &>/dev/null && echo true || echo false)
    REDIS_OK=$(redis-cli ping 2>/dev/null | grep -q PONG && echo true || echo false)
    NGINX_OK=$(svc_active nginx && echo true || echo false)
    HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
    APP_OK=$([[ "$HTTP_CODE" == "200" ]] && echo true || echo false)
    OLLAMA_OK=$(curl -sf http://localhost:11434/api/tags &>/dev/null && echo true || echo false)
    COMMIT=$(cd "$APP_DIR" 2>/dev/null && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    VERSION=$(node -e "process.stdout.write(require('${APP_DIR}/package.json').version)" 2>/dev/null || echo "?")

    cat << JSON
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "services": {
    "postgresql": $PG_OK,
    "redis":      $REDIS_OK,
    "nginx":      $NGINX_OK,
    "application": $APP_OK,
    "ollama":     $OLLAMA_OK
  },
  "app": {
    "version": "$VERSION",
    "commit":  "$COMMIT",
    "http_status": $HTTP_CODE
  }
}
JSON
    return
  fi

  # ── Affichage lisible ──────────────────────────────────────
  clear
  echo ""
  echo -e "${BLUE}${BOLD}┌─────────────────────────────────────────────────────┐${RESET}"
  echo -e "${BLUE}${BOLD}│  Move to AI — État des services                     │${RESET}"
  echo -e "${BLUE}${BOLD}│  $(date '+%Y-%m-%d %H:%M:%S')                              │${RESET}"
  echo -e "${BLUE}${BOLD}└─────────────────────────────────────────────────────┘${RESET}"
  echo ""

  # ── Infrastructure ─────────────────────────────────────────
  echo -e "${BOLD}Infrastructure :${RESET}"

  # PostgreSQL
  if svc_active postgresql; then
    CONN=$(sudo -u movetoai psql -h localhost -U movetoai movetoai_prod \
      -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='movetoai_prod';" \
      2>/dev/null | xargs || echo "?")
    PG_SIZE=$(sudo -u movetoai psql -h localhost -U movetoai movetoai_prod \
      -t -c "SELECT pg_size_pretty(pg_database_size('movetoai_prod'));" \
      2>/dev/null | xargs || echo "?")
    echo -e "  ${GREEN}●${RESET} PostgreSQL 16     connexions: ${CONN} · taille BDD: ${PG_SIZE}"
  else
    echo -e "  ${RED}○${RESET} PostgreSQL 16     ${RED}ARRÊTÉ${RESET}"
  fi

  # Redis
  if redis-cli ping 2>/dev/null | grep -q PONG; then
    REDIS_MEM=$(redis-cli info memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d $'\r' || echo "?")
    REDIS_KEYS=$(redis-cli dbsize 2>/dev/null || echo "?")
    echo -e "  ${GREEN}●${RESET} Redis 7           mémoire: ${REDIS_MEM} · clés: ${REDIS_KEYS}"
  else
    echo -e "  ${RED}○${RESET} Redis 7           ${RED}ARRÊTÉ ou erreur auth${RESET}"
  fi

  # Nginx
  if svc_active nginx; then
    NGINX_WORKERS=$(pgrep -c nginx 2>/dev/null || echo "?")
    echo -e "  ${GREEN}●${RESET} Nginx             workers: ${NGINX_WORKERS}"
  else
    echo -e "  ${RED}○${RESET} Nginx             ${RED}ARRÊTÉ${RESET}"
  fi

  # Ollama (optionnel)
  if systemctl list-unit-files 2>/dev/null | grep -q ollama.service; then
    if curl -sf http://localhost:11434/api/tags &>/dev/null; then
      MODELS_LOADED=$(ollama list 2>/dev/null | tail -n +2 | wc -l || echo "0")
      echo -e "  ${GREEN}●${RESET} Ollama            modèles: ${MODELS_LOADED}"
    else
      echo -e "  $(svc_icon ollama) Ollama            $(svc_active ollama && echo 'démarrage...' || echo "${RED}ARRÊTÉ${RESET}")"
    fi
  fi

  echo ""

  # ── Application ────────────────────────────────────────────
  echo -e "${BOLD}Application :${RESET}"

  HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
  HEALTH_BODY=$(curl -sf http://localhost:3000/api/health 2>/dev/null || echo '{}')

  # PM2 infos
  PM2_INFO=$(sudo -u "$APP_USER" pm2 jlist 2>/dev/null || echo "[]")
  PM2_STATUS=$(echo "$PM2_INFO" | node -e "
    let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
      try{const a=JSON.parse(d).filter(p=>p.name==='movetoai');
      if(!a.length){console.log('non enregistré');return;}
      const p=a[0];const e=p.pm2_env||{};
      const up=e.pm_uptime?Math.round((Date.now()-e.pm_uptime)/1000)+'s':'?';
      const mem=p.monit?Math.round(p.monit.memory/1024/1024)+'MB':'?';
      const cpu=p.monit?p.monit.cpu+'%':'?';
      const inst=a.length;
      console.log(e.status+' · '+inst+' instance(s) · CPU:'+cpu+' · RAM:'+mem+' · uptime:'+up);
      }catch(e){console.log('inconnu');}
    });
  " 2>/dev/null || echo "inconnu")

  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo -e "  ${GREEN}●${RESET} Next.js           HTTP $HTTP_STATUS · $PM2_STATUS"
  else
    echo -e "  ${RED}○${RESET} Next.js           HTTP $HTTP_STATUS · $PM2_STATUS"
    echo -e "    ${DIM}Logs : sudo -u movetoai pm2 logs movetoai --lines 20${RESET}"
  fi

  if [[ "$HEALTH_BODY" != "{}" && -n "$HEALTH_BODY" ]]; then
    echo -e "    ${DIM}Health: $HEALTH_BODY${RESET}"
  fi

  echo ""

  # ── Métriques système ──────────────────────────────────────
  echo -e "${BOLD}Système :${RESET}"

  # CPU (load average)
  LOAD=$(cat /proc/loadavg | awk '{print $1, $2, $3}')
  CPU_CORES=$(nproc)
  echo -e "  Load average  : $LOAD  (${CPU_CORES} CPU)"

  # RAM
  RAM_USED=$(free -h | awk '/^Mem:/{print $3}')
  RAM_TOTAL=$(free -h | awk '/^Mem:/{print $2}')
  RAM_PCT=$(free | awk '/^Mem:/{printf "%.0f", $3/$2*100}')
  echo -e "  RAM           : ${RAM_USED} / ${RAM_TOTAL} (${RAM_PCT}%)"

  # Disque
  DISK_USED=$(df -h /opt/movetoai 2>/dev/null | tail -1 | awk '{print $3}')
  DISK_TOTAL=$(df -h /opt/movetoai 2>/dev/null | tail -1 | awk '{print $2}')
  DISK_PCT=$(df /opt/movetoai 2>/dev/null | tail -1 | awk '{print $5}')
  echo -e "  Disque /opt   : ${DISK_USED} / ${DISK_TOTAL} (${DISK_PCT})"

  # Uptime système
  SYS_UPTIME=$(uptime -p 2>/dev/null || echo "?")
  echo -e "  Uptime système: $SYS_UPTIME"

  echo ""

  # ── Version ────────────────────────────────────────────────
  echo -e "${BOLD}Version :${RESET}"
  APP_VERSION=$(node -e "process.stdout.write(require('${APP_DIR}/package.json').version)" 2>/dev/null || echo "?")
  COMMIT_LOG=$(cd "$APP_DIR" 2>/dev/null && git log --oneline -1 2>/dev/null || echo "inconnu")
  NODE_VER=$(node -v 2>/dev/null || echo "?")
  echo -e "  App     : v${APP_VERSION}"
  echo -e "  Commit  : $COMMIT_LOG"
  echo -e "  Node.js : $NODE_VER"

  echo ""

  # ── Certifications expirant dans 90 jours ─────────────────
  if svc_active postgresql; then
    EXPIRING=$(sudo -u movetoai psql -h localhost -U movetoai movetoai_prod \
      -t -A -F'|' -c "
        SELECT c.short_name, wc.expiry_date::date,
               (wc.expiry_date::date - CURRENT_DATE) AS days_left
        FROM workspace_certifications wc
        JOIN certification_catalogs c ON c.id = wc.catalog_id
        WHERE wc.status IN ('obtained', 'in_progress')
          AND wc.expiry_date IS NOT NULL
          AND wc.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
        ORDER BY wc.expiry_date ASC
        LIMIT 10;
      " 2>/dev/null || echo "")

    if [[ -n "$EXPIRING" ]]; then
      echo -e "${YELLOW}${BOLD}⚠  Certifications expirant bientôt :${RESET}"
      while IFS='|' read -r name expiry days; do
        [[ -z "$name" ]] && continue
        days=$(echo "$days" | tr -d ' ')
        if [[ "$days" -le 0 ]]; then
          echo -e "  ${RED}  ✗ $name — EXPIRÉE le $expiry${RESET}"
        elif [[ "$days" -le 30 ]]; then
          echo -e "  ${RED}  ⚠ $name — expire le $expiry (J-${days})${RESET}"
        else
          echo -e "  ${YELLOW}  ! $name — expire le $expiry (J-${days})${RESET}"
        fi
      done <<< "$EXPIRING"
      echo ""
    fi
  fi

  # ── Erreurs PM2 récentes ───────────────────────────────────
  RECENT_ERRORS=$(sudo -u "$APP_USER" pm2 logs movetoai --err --lines 3 --nostream 2>/dev/null \
    | grep -v "^$" | tail -3 || echo "")
  if [[ -n "$RECENT_ERRORS" ]]; then
    echo -e "${BOLD}Erreurs PM2 récentes :${RESET}"
    echo -e "${DIM}${RECENT_ERRORS}${RESET}"
    echo ""
  fi

  echo -e "${DIM}Dernière vérification : $(date '+%H:%M:%S')${RESET}"
  if $WATCH_MODE; then
    echo -e "${DIM}Rafraîchissement automatique toutes les 5s — Ctrl+C pour quitter${RESET}"
  fi
  echo ""
}

# ── Mode watch ─────────────────────────────────────────────
if $WATCH_MODE; then
  while true; do
    run_checks
    sleep 5
  done
else
  run_checks
fi
