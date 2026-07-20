#!/bin/sh
# Nightly backup: dumps PostgreSQL and archives generated images/uploads,
# then prunes backups older than BACKUP_RETENTION_DAYS. Intended to run via
# cron on the VPS (see docs/BACKUP_GUIDE.md).
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# shellcheck disable=SC1091
[ -f .env ] && . ./.env

BACKUP_DIR="${BACKUP_DIR:-/var/backups/pablo-ai}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

echo "[backup] Dumping PostgreSQL database..."
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-pablo}" "${POSTGRES_DB:-pablo_ai}" \
  | gzip > "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz"

echo "[backup] Archiving generated images/uploads..."
docker run --rm \
  -v "$(basename "$PROJECT_DIR")_api_uploads:/data" \
  -v "$BACKUP_DIR:/backup" \
  alpine tar czf "/backup/uploads_${TIMESTAMP}.tar.gz" -C /data .

echo "[backup] Pruning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -mtime "+${RETENTION_DAYS}" -delete

echo "[backup] Done: db_${TIMESTAMP}.sql.gz, uploads_${TIMESTAMP}.tar.gz"
