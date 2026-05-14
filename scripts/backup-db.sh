#!/usr/bin/env bash
# =============================================================================
# BluePilot AI — Backup MySQL database
# Usage:
#   sudo ./scripts/backup-db.sh
#
# Crontab (backup quotidien à 2h) :
#   0 2 * * * /opt/movetoai/scripts/backup-db.sh >> /var/log/movetoai-backup.log 2>&1
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${APP_DIR}/.env"
BACKUP_DIR="${MOVETOAI_BACKUP_DIR:-/var/backups/movetoai}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

[[ -f "$ENV_FILE" ]] || { echo "[ERROR] .env introuvable : $ENV_FILE" >&2; exit 1; }

set -a
# shellcheck disable=SC1090
source <(grep -v '^#' "$ENV_FILE" | grep -v '^\s*$' | grep -E '^[A-Z_]+=')
set +a

[[ -n "${DATABASE_URL:-}" ]] || { echo "[ERROR] DATABASE_URL non défini" >&2; exit 1; }

DB_USER=$(echo "$DATABASE_URL" | sed -E 's|mysql://([^:]+):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^@]+@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^@]+@[^:]+:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^/]+/([^?]+).*|\1|')

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/movetoai_${TIMESTAMP}.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup de '${DB_NAME}'…"

mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --single-transaction \
  --quick \
  --lock-tables=false \
  --routines \
  --triggers \
  "$DB_NAME" \
  | gzip -9 > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $BACKUP_FILE ($SIZE)"

DELETED=$(find "$BACKUP_DIR" -name "movetoai_*.sql.gz" -mtime "+${RETENTION_DAYS}" -print -delete | wc -l)
[[ "$DELETED" -gt 0 ]] && echo "[$(date '+%Y-%m-%d %H:%M:%S')] $DELETED ancien(s) backup(s) supprimé(s)"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Terminé."
