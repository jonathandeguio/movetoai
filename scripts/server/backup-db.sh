#!/bin/bash
# ============================================================
# Move to AI — Sauvegarde manuelle de la base de données
# Usage : bash scripts/server/backup-db.sh [--dest /chemin/] [--compress] [--keep 30]
#
# Crée un dump PostgreSQL compressé avec horodatage.
# Par défaut : /opt/movetoai/backups/
# ============================================================

set -euo pipefail

APP_DIR="/opt/movetoai/app"
DEFAULT_DEST="/opt/movetoai/backups"
DEST="$DEFAULT_DEST"
COMPRESS=true
KEEP_DAYS=30

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
BOLD='\033[1m'; RESET='\033[0m'

log()   { echo -e "${GREEN}[✓]${RESET} $1"; }
warn()  { echo -e "${YELLOW}[⚠]${RESET} $1"; }
error() { echo -e "${RED}[✗]${RESET} $1"; exit 1; }

while [[ $# -gt 0 ]]; do
  case $1 in
    --dest)     DEST="$2";      shift 2 ;;
    --keep)     KEEP_DAYS="$2"; shift 2 ;;
    --no-compress) COMPRESS=false; shift ;;
    *) warn "Paramètre inconnu: $1"; shift ;;
  esac
done

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
HOSTNAME=$(hostname -s)

if $COMPRESS; then
  BACKUP_FILE="$DEST/db-${HOSTNAME}-${TIMESTAMP}.sql.gz"
else
  BACKUP_FILE="$DEST/db-${HOSTNAME}-${TIMESTAMP}.sql"
fi

echo ""
echo -e "${BOLD}━━━ Move to AI — Sauvegarde base de données ━━━${RESET}"
echo -e "  Destination : $BACKUP_FILE"
echo -e "  Rétention   : ${KEEP_DAYS} jours"
echo ""

# Extraire les infos de connexion depuis .env
ENV_FILE="$APP_DIR/.env"
[[ ! -f "$ENV_FILE" ]] && error "Fichier .env introuvable : $ENV_FILE"

DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '"')
[[ -z "$DATABASE_URL" ]] && error "DATABASE_URL non trouvée dans .env"

# Parser l'URL postgresql://user:pass@host:port/dbname
DB_USER=$(echo "$DATABASE_URL" | sed 's|postgresql://\([^:]*\):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed 's|postgresql://[^:]*:\([^@]*\)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL" | sed 's|.*@\([^:]*\):.*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed 's|.*:\([0-9]*\)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/\([^?]*\).*|\1|')

log "Connexion : ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Vérifier la connexion
PGPASSWORD="$DB_PASS" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  || error "Impossible de se connecter à la base de données"

# Créer le répertoire de destination
mkdir -p "$DEST"

# Dump
echo -e "  Dump en cours..."

if $COMPRESS; then
  PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    --format=plain \
    --no-owner \
    --no-acl \
    "$DB_NAME" \
    | gzip -9 > "$BACKUP_FILE"
else
  PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    --format=plain \
    --no-owner \
    --no-acl \
    "$DB_NAME" \
    > "$BACKUP_FILE"
fi

# Vérifier que le fichier n'est pas vide
FILE_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
FILE_BYTES=$(stat -c%s "$BACKUP_FILE")
[[ $FILE_BYTES -lt 1000 ]] && error "Backup suspectement petit (${FILE_SIZE}) — vérifier la connexion"

log "Backup créé : $BACKUP_FILE ($FILE_SIZE)"

# Purger les anciens backups
if [[ $KEEP_DAYS -gt 0 ]]; then
  DELETED=$(find "$DEST" -maxdepth 1 -name "db-*.sql*" -mtime +${KEEP_DAYS} -print -delete | wc -l)
  [[ $DELETED -gt 0 ]] && log "Backups expirés supprimés : $DELETED fichier(s)"
fi

# Lister les backups disponibles
echo ""
echo -e "${BOLD}Backups disponibles dans $DEST :${RESET}"
ls -lh "$DEST"/db-*.sql* 2>/dev/null | awk '{print "  " $5 "\t" $9}' || echo "  (aucun)"
echo ""

echo -e "${GREEN}${BOLD}✓ Backup terminé${RESET}"
echo -e "  Fichier : $BACKUP_FILE"
echo -e "  Taille  : $FILE_SIZE"
echo ""
echo -e "  Pour restaurer :"
if $COMPRESS; then
  echo -e "    gunzip -c $BACKUP_FILE | PGPASSWORD='***' psql -h $DB_HOST -U $DB_USER $DB_NAME"
else
  echo -e "    PGPASSWORD='***' psql -h $DB_HOST -U $DB_USER $DB_NAME < $BACKUP_FILE"
fi
echo ""
