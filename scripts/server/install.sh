#!/bin/bash
# ============================================================
# Move to AI — Script d'installation complète
# OS : Ubuntu 22.04 LTS / Debian 12
# Usage : sudo bash scripts/server/install.sh [--domain mondomaine.com] [--email admin@example.com]
# ============================================================

set -euo pipefail  # Arrêt immédiat si erreur · variables non définies · pipe fail

# ── Couleurs terminal ──────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${GREEN}[✓]${RESET} $1"; }
warn()    { echo -e "${YELLOW}[⚠]${RESET} $1"; }
error()   { echo -e "${RED}[✗]${RESET} $1"; exit 1; }
section() { echo -e "\n${BLUE}${BOLD}━━━ $1 ━━━${RESET}\n"; }

# ── Vérifications préalables ──────────────────────────────
[[ $EUID -ne 0 ]] && error "Ce script doit être exécuté en root (sudo bash install.sh)"
[[ ! -f /etc/os-release ]] && error "Système d'exploitation non supporté"
source /etc/os-release
[[ "$ID" != "ubuntu" && "$ID" != "debian" ]] && error "Ubuntu 22.04 ou Debian 12 requis"

# ── Paramètres ─────────────────────────────────────────────
DOMAIN=""
EMAIL=""
APP_DIR="/opt/movetoai"
APP_USER="movetoai"
APP_PORT="3000"
DB_NAME="movetoai_prod"
DB_USER="movetoai"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
NODE_VERSION="22"
NEXTAUTH_SECRET=$(openssl rand -base64 32)

while [[ $# -gt 0 ]]; do
  case $1 in
    --domain) DOMAIN="$2"; shift 2 ;;
    --email)  EMAIL="$2";  shift 2 ;;
    *) warn "Paramètre inconnu: $1"; shift ;;
  esac
done

# ── Bannière ───────────────────────────────────────────────
echo -e "${BLUE}${BOLD}"
cat << 'EOF'
  __  __                 _       _        _    ___
 |  \/  | _____   _____ | |_ ___| |      / \  |_ _|
 | |\/| |/ _ \ \ / / _ \| __/ _ \ |     / _ \  | |
 | |  | | (_) \ V /  __/| || (_) | |_  / ___ \ | |
 |_|  |_|\___/ \_/ \___| \__\___/|____/_/   \_\___|
EOF
echo -e "${RESET}"
echo -e "${BOLD}Installation Move to AI — Serveur de production${RESET}"
echo -e "Domaine    : ${DOMAIN:-'non défini (HTTP uniquement)'}"
echo -e "Email      : ${EMAIL:-'non défini (pas de SSL auto)'}"
echo -e "Répertoire : ${APP_DIR}"
echo -e "Node.js    : v${NODE_VERSION}"
echo ""
read -p "Continuer l'installation ? [y/N] " -n 1 -r
echo ""
[[ ! $REPLY =~ ^[Yy]$ ]] && error "Installation annulée"

# ═══════════════════════════════════════════════════════════
section "1/10 — Mise à jour système"
# ═══════════════════════════════════════════════════════════

apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git unzip htop \
  build-essential ca-certificates gnupg \
  lsb-release software-properties-common \
  ufw fail2ban logrotate \
  openssl jq
log "Packages système installés"

# ═══════════════════════════════════════════════════════════
section "2/10 — Création de l'utilisateur système"
# ═══════════════════════════════════════════════════════════

if ! id -u "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash -d /home/$APP_USER "$APP_USER"
  log "Utilisateur $APP_USER créé"
else
  warn "Utilisateur $APP_USER existe déjà"
fi

# Créer les répertoires de l'application
mkdir -p "$APP_DIR"/{app,logs,backups,ssl,tmp}
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
log "Répertoires créés : $APP_DIR"

# ═══════════════════════════════════════════════════════════
section "3/10 — Installation Node.js ${NODE_VERSION}"
# ═══════════════════════════════════════════════════════════

if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt "$NODE_VERSION" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
  log "Node.js $(node -v) installé"
else
  log "Node.js $(node -v) déjà installé"
fi

# npm et PM2
npm install -g npm@latest pm2 --quiet
pm2 startup systemd -u "$APP_USER" --hp /home/$APP_USER | tail -1 | bash
log "PM2 configuré en service systemd"

# ═══════════════════════════════════════════════════════════
section "4/10 — Installation PostgreSQL 16"
# ═══════════════════════════════════════════════════════════

if ! command -v psql &>/dev/null; then
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
  echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] \
    https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
  apt-get install -y postgresql-16 postgresql-contrib-16
  log "PostgreSQL 16 installé"
else
  log "PostgreSQL déjà installé ($(psql --version))"
fi

systemctl enable postgresql
systemctl start postgresql

# Créer la base et l'utilisateur
sudo -u postgres psql << EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};

\c ${DB_NAME}
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

log "Base de données PostgreSQL configurée"

# Optimisations production
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
cat >> "$PG_CONF" << 'PGCONF'

# Move to AI — Optimisations production
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
PGCONF

# pg_hba.conf — accès local uniquement
cat > /etc/postgresql/16/main/pg_hba.conf << 'PGHBA'
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
PGHBA

systemctl restart postgresql
log "PostgreSQL configuré et redémarré"

# ═══════════════════════════════════════════════════════════
section "5/10 — Installation Redis 7"
# ═══════════════════════════════════════════════════════════

if ! command -v redis-server &>/dev/null; then
  curl -fsSL https://packages.redis.io/gpg \
    | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] \
    https://packages.redis.io/deb $(lsb_release -cs) main" \
    > /etc/apt/sources.list.d/redis.list
  apt-get update -qq
  apt-get install -y redis-server
  log "Redis 7 installé"
else
  log "Redis déjà installé ($(redis-server --version | cut -d' ' -f3))"
fi

cat > /etc/redis/redis.conf << REDISCONF
bind 127.0.0.1 -::1
protected-mode yes
port 6379
requirepass ${REDIS_PASSWORD}
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000
loglevel notice
logfile /var/log/redis/redis-server.log
dir /var/lib/redis
REDISCONF

systemctl enable redis-server
systemctl restart redis-server
log "Redis configuré et redémarré"

# ═══════════════════════════════════════════════════════════
section "6/10 — Installation Nginx"
# ═══════════════════════════════════════════════════════════

if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx
  log "Nginx installé"
else
  log "Nginx déjà installé ($(nginx -v 2>&1 | cut -d'/' -f2))"
fi

if [[ -n "$DOMAIN" ]]; then
  NGINX_SERVER_NAME="$DOMAIN www.$DOMAIN"
else
  NGINX_SERVER_NAME="_"
fi

cat > /etc/nginx/sites-available/movetoai << NGINXCONF
# Move to AI — Configuration Nginx
# Généré automatiquement par install.sh — $(date '+%Y-%m-%d')

limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=3r/m;

upstream movetoai_app {
  server 127.0.0.1:${APP_PORT};
  keepalive 32;
}

$(if [[ -n "$DOMAIN" ]]; then
cat << 'REDIR'
server {
  listen 80;
  server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
  return 301 https://\$host\$request_uri;
}
REDIR
fi)

server {
$(if [[ -n "$DOMAIN" ]]; then
echo "  listen 443 ssl http2;"
echo "  server_name ${NGINX_SERVER_NAME};"
echo "  ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;"
echo "  ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;"
echo "  ssl_protocols TLSv1.2 TLSv1.3;"
echo "  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;"
echo "  ssl_prefer_server_ciphers off;"
echo "  ssl_session_cache shared:SSL:10m;"
echo "  ssl_session_timeout 10m;"
echo "  add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;"
else
echo "  listen 80;"
echo "  server_name ${NGINX_SERVER_NAME};"
fi)

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  client_max_body_size 20M;
  access_log ${APP_DIR}/logs/nginx-access.log;
  error_log  ${APP_DIR}/logs/nginx-error.log;

  location /_next/static/ {
    alias ${APP_DIR}/app/.next/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  location /public/ {
    alias ${APP_DIR}/app/public/;
    expires 7d;
    access_log off;
  }

  location /api/auth/ {
    limit_req zone=login burst=5 nodelay;
    proxy_pass http://movetoai_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
  }

  # Cron route — localhost uniquement
  location /api/cron/ {
    allow 127.0.0.1;
    deny all;
    proxy_pass http://movetoai_app;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://movetoai_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
  }

  location / {
    proxy_pass http://movetoai_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_read_timeout 60s;
  }

  location /api/health {
    proxy_pass http://movetoai_app;
    access_log off;
  }
}
NGINXCONF

# Remplacer le placeholder de domaine dans la redirection HTTP
[[ -n "$DOMAIN" ]] && sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/movetoai

ln -sf /etc/nginx/sites-available/movetoai /etc/nginx/sites-enabled/movetoai
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl restart nginx
log "Nginx configuré"

# ═══════════════════════════════════════════════════════════
section "7/10 — SSL avec Let's Encrypt"
# ═══════════════════════════════════════════════════════════

if [[ -n "$DOMAIN" && -n "$EMAIL" ]]; then
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --email "$EMAIL" --agree-tos --non-interactive \
    --redirect --keep-until-expiring
  log "Certificat SSL installé pour $DOMAIN"
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --nginx") | crontab -
  log "Renouvellement SSL automatique configuré"
else
  warn "Domaine ou email non fourni — SSL non configuré (HTTP uniquement)"
fi

# ═══════════════════════════════════════════════════════════
section "8/10 — Firewall (UFW) et Fail2ban"
# ═══════════════════════════════════════════════════════════

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny "$APP_PORT"/tcp   # Bloquer accès direct Node.js depuis l'extérieur
ufw --force enable
log "Firewall UFW configuré"

cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
action   = iptables-multiport[name=nginx-limit-req, port="http,https"]
logpath  = /opt/movetoai/logs/nginx-error.log
FAIL2BAN

systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2ban configuré"

# ═══════════════════════════════════════════════════════════
section "9/10 — Clonage et build de l'application"
# ═══════════════════════════════════════════════════════════

read -p "URL du dépôt Git (laisser vide pour copier le répertoire courant) : " GIT_REPO

if [[ -n "$GIT_REPO" ]]; then
  sudo -u "$APP_USER" git clone "$GIT_REPO" "$APP_DIR/app"
  log "Dépôt cloné depuis $GIT_REPO"
else
  CURRENT_DIR=$(pwd)
  cp -r "$CURRENT_DIR" "$APP_DIR/app"
  chown -R "$APP_USER:$APP_USER" "$APP_DIR/app"
  log "Application copiée depuis $CURRENT_DIR"
fi

# ── Générer le fichier .env de production ─────────────────
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
CRON_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

cat > "$APP_DIR/app/.env" << ENVFILE
# ============================================================
# Move to AI — Variables d'environnement PRODUCTION
# Généré automatiquement le $(date '+%Y-%m-%d %H:%M:%S')
# ⚠  NE JAMAIS VERSIONNER CE FICHIER
# ============================================================

# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=${APP_PORT}
NEXT_PUBLIC_APP_URL=$(if [[ -n "$DOMAIN" ]]; then echo "https://${DOMAIN}"; else echo "http://localhost:${APP_PORT}"; fi)

# Base de données
DATABASE_URL=${DATABASE_URL}

# Auth (NextAuth v5)
NEXTAUTH_URL=$(if [[ -n "$DOMAIN" ]]; then echo "https://${DOMAIN}"; else echo "http://localhost:${APP_PORT}"; fi)
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
AUTH_SECRET=${NEXTAUTH_SECRET}

# Redis (Upstash-compatible via URL)
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# LLM (à compléter selon votre stratégie)
ANTHROPIC_API_KEY=
GROQ_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_ENABLED=false
GROQ_ENABLED=false
LLM_STRATEGY=auto

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM=noreply@${DOMAIN:-movetoai.local}

# Stripe (paiements)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# hCaptcha (formulaires)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=

# Cron (protection des endpoints /api/cron/*)
CRON_SECRET=${CRON_SECRET}

# Sentry (monitoring erreurs — optionnel)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
ENVFILE

chmod 600 "$APP_DIR/app/.env"
chown "$APP_USER:$APP_USER" "$APP_DIR/app/.env"
log "Fichier .env généré"

# ── Build de l'application ─────────────────────────────────
cd "$APP_DIR/app"
sudo -u "$APP_USER" bash << BUILDSCRIPT
  set -e
  cd ${APP_DIR}/app
  npm ci --prefer-offline
  npx prisma generate
  npx prisma db push --accept-data-loss
  npm run build
  node --env-file=.env prisma/seed.js
  node --env-file=.env prisma/seed-certifications.js
BUILDSCRIPT

log "Application buildée avec succès"

# ═══════════════════════════════════════════════════════════
section "10/10 — Configuration PM2 et démarrage"
# ═══════════════════════════════════════════════════════════

cat > "$APP_DIR/app/ecosystem.config.js" << PM2CONFIG
// Move to AI — Configuration PM2
// Généré par install.sh — $(date '+%Y-%m-%d')
module.exports = {
  apps: [
    {
      name:         'movetoai',
      script:       'node_modules/.bin/next',
      args:         'start',
      cwd:          '${APP_DIR}/app',
      instances:    'max',          // tous les CPU disponibles
      exec_mode:    'cluster',      // zero-downtime reload
      autorestart:  true,
      watch:        false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT:     ${APP_PORT},
      },
      error_file:   '${APP_DIR}/logs/pm2-error.log',
      out_file:     '${APP_DIR}/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:   true,
    },
    {
      // Worker cron quotidien (certifications, alertes, qualité)
      name:         'movetoai-cron',
      script:       'scripts/server/cron-worker.js',
      cwd:          '${APP_DIR}/app',
      instances:    1,
      exec_mode:    'fork',
      autorestart:  true,
      cron_restart: '0 8 * * *',   // chaque jour à 08h00
      watch:        false,
      env_production: { NODE_ENV: 'production' },
      error_file:   '${APP_DIR}/logs/cron-error.log',
      out_file:     '${APP_DIR}/logs/cron-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ]
}
PM2CONFIG

chown "$APP_USER:$APP_USER" "$APP_DIR/app/ecosystem.config.js"

sudo -u "$APP_USER" pm2 start "$APP_DIR/app/ecosystem.config.js" --env production
sudo -u "$APP_USER" pm2 save
log "PM2 démarré et sauvegardé"

# ── Logrotate ──────────────────────────────────────────────
cat > /etc/logrotate.d/movetoai << LOGROTATE
${APP_DIR}/logs/*.log {
  daily
  missingok
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 ${APP_USER} ${APP_USER}
  postrotate
    sudo -u ${APP_USER} pm2 reloadLogs
  endscript
}
LOGROTATE

# ── Sauvegarde des credentials ─────────────────────────────
CREDS_FILE="$APP_DIR/INSTALLATION_CREDENTIALS.txt"
cat > "$CREDS_FILE" << CREDS
============================================================
MOVE TO AI — CREDENTIALS D'INSTALLATION
Généré le : $(date '+%Y-%m-%d %H:%M:%S')
============================================================

PostgreSQL :
  Host     : localhost:5432
  Database : ${DB_NAME}
  User     : ${DB_USER}
  Password : ${DB_PASSWORD}

Redis :
  Host     : localhost:6379
  Password : ${REDIS_PASSWORD}

NextAuth / Auth Secret : ${NEXTAUTH_SECRET}
Cron Secret            : ${CRON_SECRET}

Application :
  Répertoire : ${APP_DIR}/app
  Port interne: ${APP_PORT}
  User système: ${APP_USER}
  Logs        : ${APP_DIR}/logs/

⚠  CONSERVER CE FICHIER EN LIEU SÛR ET SUPPRIMER APRÈS SAUVEGARDE
============================================================
CREDS

chmod 600 "$CREDS_FILE"
chown root:root "$CREDS_FILE"

# ── Résumé final ───────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║  Move to AI installé avec succès !                  ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  URL         : $(if [[ -n "$DOMAIN" ]]; then echo "https://$DOMAIN"; else echo "http://$(curl -s ifconfig.me 2>/dev/null || echo 'VOTRE_IP'):$APP_PORT"; fi)"
echo -e "  App dir     : ${APP_DIR}/app"
echo -e "  Logs        : ${APP_DIR}/logs/"
echo -e "  Credentials : ${CREDS_FILE}"
echo ""
echo -e "${YELLOW}Actions requises :${RESET}"
echo -e "  1. Éditer ${APP_DIR}/app/.env (API keys manquantes : ANTHROPIC, RESEND, STRIPE…)"
echo -e "  2. sudo -u movetoai pm2 restart movetoai"
echo -e "  3. Tester : curl http://localhost:${APP_PORT}/api/health"
echo ""
echo -e "${BLUE}Commandes utiles :${RESET}"
echo -e "  bash scripts/server/status.sh          # État des services"
echo -e "  bash scripts/server/update.sh          # Mise à jour zero-downtime"
echo -e "  sudo -u movetoai pm2 logs movetoai     # Logs en direct"
echo ""
