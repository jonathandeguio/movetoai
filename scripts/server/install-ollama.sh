#!/bin/bash
# ============================================================
# Move to AI — Installation Ollama + modèles LLM locaux
# Usage : sudo bash scripts/server/install-ollama.sh [--models llama3.1:8b,mistral:7b]
# ============================================================

set -euo pipefail

APP_DIR="/opt/movetoai"
MODELS="llama3.1:8b"     # Modèle par défaut (léger, 8B params)
OLLAMA_DIR="${APP_DIR}/ollama-models"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${GREEN}[✓]${RESET} $1"; }
warn()    { echo -e "${YELLOW}[⚠]${RESET} $1"; }
error()   { echo -e "${RED}[✗]${RESET} $1"; exit 1; }
section() { echo -e "\n${BLUE}${BOLD}━━━ $1 ━━━${RESET}\n"; }

while [[ $# -gt 0 ]]; do
  case $1 in
    --models) MODELS="$2"; shift 2 ;;
    *) warn "Paramètre inconnu: $1"; shift ;;
  esac
done

# ═══════════════════════════════════════════════════════════
section "1/4 — Vérification des ressources système"
# ═══════════════════════════════════════════════════════════

TOTAL_RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
DISK_FREE_GB=$(df -BG "$APP_DIR" | tail -1 | awk '{print $4}' | tr -d 'G')

log "RAM disponible      : ${TOTAL_RAM_GB}GB"
log "Espace disque libre : ${DISK_FREE_GB}GB"

# Vérifications selon le modèle demandé
if echo "$MODELS" | grep -q "70b"; then
  [[ $TOTAL_RAM_GB -lt 48 ]] && warn "Llama 3.1 70B recommande 48GB+ RAM (actuel: ${TOTAL_RAM_GB}GB)"
  [[ $DISK_FREE_GB -lt 50 ]] && error "Espace insuffisant pour 70B : 50GB requis (actuel: ${DISK_FREE_GB}GB)"
  log "Modèle 70B détecté — espace disque requis : ~40GB"
elif echo "$MODELS" | grep -q "8b\|7b"; then
  [[ $TOTAL_RAM_GB -lt 8 ]]  && warn "Modèle 8B recommande 8GB+ RAM (actuel: ${TOTAL_RAM_GB}GB)"
  [[ $DISK_FREE_GB -lt 10 ]] && error "Espace insuffisant : 10GB requis (actuel: ${DISK_FREE_GB}GB)"
  log "Modèle 8B/7B détecté — espace disque requis : ~5-8GB"
fi

# Vérifier la présence de GPU NVIDIA (optionnel)
if command -v nvidia-smi &>/dev/null; then
  GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1)
  log "GPU détecté : $GPU_NAME (accélération activée)"
else
  warn "Pas de GPU NVIDIA détecté — Ollama utilisera le CPU (plus lent)"
fi

# ═══════════════════════════════════════════════════════════
section "2/4 — Installation et configuration d'Ollama"
# ═══════════════════════════════════════════════════════════

if command -v ollama &>/dev/null; then
  log "Ollama déjà installé ($(ollama --version 2>/dev/null || echo 'version inconnue'))"
  warn "Mise à jour d'Ollama vers la dernière version..."
fi

curl -fsSL https://ollama.com/install.sh | sh
log "Ollama installé"

# Créer l'utilisateur et le répertoire de modèles
if ! id -u ollama &>/dev/null; then
  useradd -r -s /bin/false -d "$OLLAMA_DIR" ollama
fi
mkdir -p "$OLLAMA_DIR"
chown -R ollama:ollama "$OLLAMA_DIR"

# Service systemd pour Ollama
cat > /etc/systemd/system/ollama.service << OLLAMASVC
[Unit]
Description=Ollama LLM Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ollama
Group=ollama
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=5
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_MODELS=${OLLAMA_DIR}"
Environment="OLLAMA_NUM_PARALLEL=2"
Environment="OLLAMA_MAX_LOADED_MODELS=2"
Environment="OLLAMA_KEEP_ALIVE=5m"

[Install]
WantedBy=default.target
OLLAMASVC

systemctl daemon-reload
systemctl enable ollama
systemctl start ollama

# Attendre qu'Ollama soit prêt (max 30s)
log "Attente du démarrage d'Ollama..."
for i in {1..30}; do
  if curl -sf http://localhost:11434/api/tags &>/dev/null; then
    log "Ollama prêt (${i}s)"
    break
  fi
  sleep 1
  if [[ $i -eq 30 ]]; then
    error "Ollama n'a pas démarré en 30 secondes"
  fi
done

# ═══════════════════════════════════════════════════════════
section "3/4 — Téléchargement des modèles"
# ═══════════════════════════════════════════════════════════

IFS=',' read -ra MODEL_LIST <<< "$MODELS"
for model in "${MODEL_LIST[@]}"; do
  model=$(echo "$model" | xargs)   # trim whitespace
  log "Téléchargement de $model..."

  if echo "$model" | grep -q "70b"; then
    warn "Ce téléchargement peut prendre 30-60 minutes selon la connexion..."
  fi

  if ollama list 2>/dev/null | grep -q "^${model}"; then
    log "Modèle $model déjà présent — skip"
    continue
  fi

  ollama pull "$model"
  log "Modèle $model téléchargé ✓"
done

# ── Test de fonctionnement ─────────────────────────────────
section "Test des modèles"
for model in "${MODEL_LIST[@]}"; do
  model=$(echo "$model" | xargs)
  log "Test de $model..."
  RESPONSE=$(echo "Dis bonjour en français en une phrase courte." \
    | ollama run "$model" 2>/dev/null | head -3 || echo "ERREUR")

  if [[ "$RESPONSE" != "ERREUR" && -n "$RESPONSE" ]]; then
    log "$model opérationnel : ${RESPONSE:0:80}..."
  else
    warn "Test de $model inconclusif — vérifier manuellement avec 'ollama run $model'"
  fi
done

# ═══════════════════════════════════════════════════════════
section "4/4 — Mise à jour de la configuration"
# ═══════════════════════════════════════════════════════════

ENV_FILE="${APP_DIR}/app/.env"
if [[ -f "$ENV_FILE" ]]; then
  FIRST_MODEL=$(echo "$MODELS" | cut -d',' -f1 | xargs)

  # Activer Ollama
  sed -i 's/^OLLAMA_ENABLED=.*/OLLAMA_ENABLED=true/' "$ENV_FILE"

  # Modèles
  if grep -q "^OLLAMA_MODEL_SIMPLE" "$ENV_FILE"; then
    sed -i "s/^OLLAMA_MODEL_SIMPLE=.*/OLLAMA_MODEL_SIMPLE=${FIRST_MODEL}/" "$ENV_FILE"
  else
    echo "OLLAMA_MODEL_SIMPLE=${FIRST_MODEL}" >> "$ENV_FILE"
  fi

  if echo "$MODELS" | grep -q "70b"; then
    COMPLEX_MODEL=$(echo "$MODELS" | tr ',' '\n' | grep "70b" | head -1 | xargs)
    if grep -q "^OLLAMA_MODEL_COMPLEX" "$ENV_FILE"; then
      sed -i "s/^OLLAMA_MODEL_COMPLEX=.*/OLLAMA_MODEL_COMPLEX=${COMPLEX_MODEL}/" "$ENV_FILE"
    else
      echo "OLLAMA_MODEL_COMPLEX=${COMPLEX_MODEL}" >> "$ENV_FILE"
    fi
  fi

  log ".env mis à jour (OLLAMA_ENABLED=true)"
  warn "Redémarrer l'application : sudo -u movetoai pm2 restart movetoai"
else
  warn "Fichier .env non trouvé — mettre à jour manuellement (OLLAMA_ENABLED, OLLAMA_BASE_URL)"
fi

# ── Résumé ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║  Ollama installé et configuré !                     ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Endpoint  : http://localhost:11434"
echo -e "  Modèles   : $(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}' | tr '\n' ' ')"
echo -e "  Stockage  : $OLLAMA_DIR"
echo ""
echo -e "${BLUE}Commandes utiles :${RESET}"
echo -e "  ollama list                     # Lister les modèles"
echo -e "  ollama run llama3.1:8b          # Chat interactif"
echo -e "  curl http://localhost:11434/api/tags  # API REST"
echo -e "  journalctl -u ollama -f         # Logs en direct"
echo ""
