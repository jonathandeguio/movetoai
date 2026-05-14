#!/bin/bash
# ============================================================
# BluePilot AI — Première installation de la base de données
#
# Usage :
#   bash scripts/db-install.sh
#   bash scripts/db-install.sh --password MonMotDePasse123
#   bash scripts/db-install.sh --db movetoai_prod --user bpai
#
# Ce script :
#   1. Crée la base de données MySQL
#   2. Crée l'utilisateur applicatif
#   3. Applique le schéma via prisma db push
#   4. Exécute les seeds (plans, rôles, certifications…)
#   5. Met à jour le .env avec la DATABASE_URL générée
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
SKIP_SEED=false
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
    --skip-seed)     SKIP_SEED=true;       shift ;;
    --env)           ENV_FILE="$2";        shift 2 ;;
    *) warn "Paramètre inconnu : $1"; shift ;;
  esac
done

# ── Générer un mot de passe si non fourni ─────────────────────
if [[ -z "$DB_PASS" ]]; then
  DB_PASS=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
  warn "Aucun mot de passe fourni — généré automatiquement"
fi

DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo ""
echo -e "${BOLD}━━━ BluePilot AI — Installation base de données ━━━${RESET}"
echo -e "  Base     : ${DB_NAME}"
echo -e "  Utilisateur : ${DB_USER}@${DB_HOST}:${DB_PORT}"
echo ""

# ══════════════════════════════════════════════════════════
section "1/5 — Vérifications préalables"
# ══════════════════════════════════════════════════════════

command -v mysql >/dev/null 2>&1    || error "mysql client introuvable (installer mysql-client)"
command -v node  >/dev/null 2>&1    || error "node introuvable"
command -v npx   >/dev/null 2>&1    || error "npx introuvable"
[[ -f "prisma/schema.prisma" ]]     || error "prisma/schema.prisma introuvable — lancer depuis la racine du projet"
[[ -f "package.json" ]]             || error "package.json introuvable — lancer depuis la racine du projet"

# Vérifier que MySQL est accessible
mysql -u"$MYSQL_ROOT_USER" -p"$(read -rsp 'Mot de passe MySQL root : ' p; echo "$p")" \
  -h"$DB_HOST" -P"$DB_PORT" --connect-timeout=5 -e "SELECT 1;" >/dev/null 2>&1 \
  || error "Impossible de se connecter à MySQL en root"

log "Prérequis OK"

# ══════════════════════════════════════════════════════════
section "2/5 — Création base & utilisateur MySQL"
# ══════════════════════════════════════════════════════════

# Demander le mot de passe root une seule fois
read -rsp $'\nMot de passe MySQL root : ' MYSQL_ROOT_PASS
echo ""

run_mysql() {
  mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" -h"$DB_HOST" -P"$DB_PORT" "$@"
}

# Vérifier si la base existe déjà
DB_EXISTS=$(run_mysql -e "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${DB_NAME}';" 2>/dev/null | grep -c "$DB_NAME" || true)
if [[ "$DB_EXISTS" -gt 0 ]]; then
  error "La base '${DB_NAME}' existe déjà. Utilisez db-reinstall.sh pour la recréer."
fi

run_mysql <<SQL
-- Base de données
CREATE DATABASE \`${DB_NAME}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Utilisateur applicatif
CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_HOST}'
  IDENTIFIED BY '${DB_PASS}';

-- Droits
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${DB_HOST}';
FLUSH PRIVILEGES;
SQL

log "Base '${DB_NAME}' créée"
log "Utilisateur '${DB_USER}' créé"

# ══════════════════════════════════════════════════════════
section "3/5 — Configuration .env"
# ══════════════════════════════════════════════════════════

if [[ -f "$ENV_FILE" ]]; then
  # Mettre à jour DATABASE_URL existante
  if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" "$ENV_FILE"
    log "DATABASE_URL mise à jour dans $ENV_FILE"
  else
    echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "$ENV_FILE"
    log "DATABASE_URL ajoutée dans $ENV_FILE"
  fi
else
  echo "DATABASE_URL=\"${DATABASE_URL}\"" > "$ENV_FILE"
  log "$ENV_FILE créé avec DATABASE_URL"
fi

# ══════════════════════════════════════════════════════════
section "4/5 — Schéma Prisma (db push)"
# ══════════════════════════════════════════════════════════

DATABASE_URL="$DATABASE_URL" npx prisma generate
log "Client Prisma généré"

DATABASE_URL="$DATABASE_URL" npx prisma db push --accept-data-loss
log "Schéma appliqué (toutes les tables créées)"

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
echo -e "${GREEN}${BOLD}✅ Installation terminée${RESET}"
echo ""
echo -e "  DATABASE_URL : ${DATABASE_URL}"
echo ""
echo -e "  ${YELLOW}⚠ Notez ce mot de passe DB — il ne sera plus affiché :${RESET}"
echo -e "  Mot de passe : ${BOLD}${DB_PASS}${RESET}"
echo ""
echo -e "  Prochaine étape : ${BOLD}npm run dev${RESET}"
echo ""
