#!/usr/bin/env bash
# =============================================================================
# BluePilot AI — Installation script for Linux (Ubuntu 22.04 / Debian 12)
# Usage:
#   chmod +x scripts/install.sh
#   sudo ./scripts/install.sh
# =============================================================================

set -euo pipefail
IFS=$'\n\t'

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()   { echo -e "${GREEN}[OK]${NC}    $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Root check ────────────────────────────────────────────────────────────────
[[ "$EUID" -ne 0 ]] && die "Ce script doit être exécuté en tant que root (sudo ./install.sh)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
APP_USER="${MOVETOAI_USER:-movetoai}"
NODE_VERSION="22"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║       BluePilot AI — Installation        ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""
log "Répertoire de l'app : $APP_DIR"
log "Utilisateur système : $APP_USER"
echo ""

# =============================================================================
# 1. SYSTEM DEPENDENCIES
# =============================================================================
log "Étape 1/7 — Mise à jour des paquets système…"
apt-get update -qq
apt-get install -y -qq \
  curl \
  gnupg \
  ca-certificates \
  git \
  build-essential \
  unzip \
  openssl \
  nginx \
  ufw \
  mysql-server \
  mysql-client
ok "Paquets système installés"

# =============================================================================
# 2. NODE.JS via NodeSource
# =============================================================================
log "Étape 2/7 — Installation de Node.js $NODE_VERSION LTS…"
if ! command -v node &>/dev/null || [[ "$(node -e 'process.exit(Number(process.version.slice(1).split(\".\")[0]) < '"$NODE_VERSION"')')" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - &>/dev/null
  apt-get install -y -qq nodejs
fi
NODE_VER=$(node --version)
ok "Node.js $NODE_VER installé"

# =============================================================================
# 3. SYSTEM USER
# =============================================================================
log "Étape 3/7 — Création de l'utilisateur système $APP_USER…"
if ! id "$APP_USER" &>/dev/null; then
  useradd --system --create-home --shell /bin/bash "$APP_USER"
  ok "Utilisateur $APP_USER créé"
else
  ok "Utilisateur $APP_USER existant — ignoré"
fi

chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# =============================================================================
# 4. DATABASE SETUP
# =============================================================================
log "Étape 4/7 — Configuration MySQL…"

systemctl enable --now mysql &>/dev/null || systemctl enable --now mysqld &>/dev/null || true

DB_NAME="${DB_NAME:-movetoai}"
DB_USER="${DB_USER:-movetoai}"
DB_PASS="${DB_PASS:-$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 28)}"

mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'
  IDENTIFIED BY '${DB_PASS}';

GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';

FLUSH PRIVILEGES;
SQL

ok "Base de données '${DB_NAME}' et utilisateur '${DB_USER}' configurés"
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"

# =============================================================================
# 5. ENVIRONMENT FILE
# =============================================================================
log "Étape 5/7 — Génération du fichier .env…"
ENV_FILE="$APP_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  warn ".env existant détecté — sauvegarde dans .env.backup"
  cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d%H%M%S)"
fi

AUTH_SECRET="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 64)"
APP_URL="${MOVETOAI_URL:-http://localhost:3000}"

cat > "$ENV_FILE" <<EOF
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="${DATABASE_URL}"

# ── App ───────────────────────────────────────────────────────────────────────
PORT=3000
NEXT_PUBLIC_APP_URL=${APP_URL}
AUTH_URL=${APP_URL}
NEXTAUTH_URL=${APP_URL}
AUTH_TRUST_HOST=true

# ── Secrets (auto-générés) ────────────────────────────────────────────────────
AUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_SECRET="${AUTH_SECRET}"

# ── Anthropic ─────────────────────────────────────────────────────────────────
# ⚠ Renseignez votre clé API ici après l'installation
ANTHROPIC_API_KEY=sk-ant-REPLACE_WITH_YOUR_KEY

# ── Cloudflare Turnstile (optionnel) ─────────────────────────────────────────
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# ── Stripe (optionnel) ───────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_REPLACE
STRIPE_WEBHOOK_SECRET=whsec_REPLACE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE
STRIPE_PRICE_PRO_MONTHLY=price_REPLACE
STRIPE_PRICE_PRO_YEARLY=price_REPLACE

# ── Resend — emails (optionnel) ───────────────────────────────────────────────
RESEND_API_KEY=re_REPLACE
EMAIL_FROM=noreply@votre-domaine.fr
EOF

chown "$APP_USER":"$APP_USER" "$ENV_FILE"
chmod 600 "$ENV_FILE"
ok ".env généré : $ENV_FILE"

# =============================================================================
# 6. NODE DEPENDENCIES + PRISMA + BUILD
# =============================================================================
log "Étape 6/7 — Installation npm, Prisma, build Next.js…"

sudo -u "$APP_USER" bash -c "
  set -e
  cd '$APP_DIR'

  echo '  → npm install…'
  npm ci --prefer-offline --no-audit --no-fund --silent 2>&1 | tail -3

  echo '  → npm install stripe @stripe/stripe-js…'
  npm install stripe @stripe/stripe-js --silent 2>&1 | tail -3

  echo '  → prisma generate…'
  npx prisma generate --silent 2>&1 | tail -3

  echo '  → prisma db push…'
  npx prisma db push --accept-data-loss --skip-generate 2>&1 | tail -5

  echo '  → next build…'
  npm run build 2>&1 | tail -20
"
ok "Build Next.js terminé"

# =============================================================================
# 7. SYSTEMD SERVICE
# =============================================================================
log "Étape 7/7 — Création du service systemd movetoai.service…"

cat > /etc/systemd/system/movetoai.service <<UNIT
[Unit]
Description=BluePilot AI (movetoai) — Next.js application
After=network.target mysql.service mysqld.service
Wants=mysql.service mysqld.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/node ${APP_DIR}/node_modules/.bin/next start --port 3000
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=5s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=movetoai

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=${APP_DIR}/.next/cache ${APP_DIR}/uploads

# Limits
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable movetoai.service
systemctl restart movetoai.service
ok "Service movetoai.service démarré et activé"

# =============================================================================
# NGINX REVERSE PROXY
# =============================================================================
DOMAIN="${MOVETOAI_DOMAIN:-_}"

cat > /etc/nginx/sites-available/movetoai <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_buffering    on;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000/_next/static/;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    client_max_body_size 50M;
}
NGINX

ln -sf /etc/nginx/sites-available/movetoai /etc/nginx/sites-enabled/movetoai
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
ok "Nginx configuré"

# ── Firewall ──────────────────────────────────────────────────────────────────
ufw allow OpenSSH     &>/dev/null || true
ufw allow 'Nginx Full' &>/dev/null || true
ufw --force enable    &>/dev/null || true
ok "Firewall activé (SSH + HTTP/HTTPS)"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo -e "${BOLD}${GREEN}════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  ✓ Installation BluePilot AI terminée !    ${NC}"
echo -e "${BOLD}${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}URL de l'app${NC}       : ${CYAN}${APP_URL}${NC}"
echo -e "  ${BOLD}Répertoire${NC}         : ${APP_DIR}"
echo -e "  ${BOLD}Utilisateur système${NC}: ${APP_USER}"
echo -e "  ${BOLD}Base de données${NC}    : ${DB_NAME} @ localhost:3306"
echo -e "  ${BOLD}Utilisateur DB${NC}     : ${DB_USER}"
echo -e "  ${BOLD}Mot de passe DB${NC}    : ${DB_PASS}"
echo ""
echo -e "  ${BOLD}${YELLOW}⚠ Actions requises après installation :${NC}"
echo -e "  1. Éditez ${APP_DIR}/.env et renseignez ANTHROPIC_API_KEY"
echo -e "  2. (Optionnel) Renseignez les clés Stripe, Resend, Turnstile"
echo -e "  3. Relancez le service : ${CYAN}sudo systemctl restart movetoai${NC}"
echo ""
echo -e "  ${BOLD}Commandes utiles :${NC}"
echo -e "  ${CYAN}sudo systemctl status movetoai${NC}        — statut"
echo -e "  ${CYAN}sudo journalctl -u movetoai -f${NC}        — logs live"
echo -e "  ${CYAN}sudo systemctl restart movetoai${NC}       — redémarrer"
echo -e "  ${CYAN}sudo -u $APP_USER npx prisma studio${NC}   — Prisma Studio"
echo ""
echo -e "  ${BOLD}Mot de passe DB sauvegardé dans${NC} : ${APP_DIR}/.env"
echo ""
