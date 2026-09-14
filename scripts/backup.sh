#!/usr/bin/env bash
# Backs up data/appart.db and data/uploads/ to a timestamped archive
# outside the app directory, so it survives even if the app directory
# itself gets wiped or corrupted. Keeps the 14 most recent backups.
# Usage: run from inside the app directory (e.g. ~/appart).
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$APP_DIR/../appart-backups"
KEEP=14

mkdir -p "$BACKUP_DIR"

if [ ! -f "$APP_DIR/data/appart.db" ]; then
  echo "Aucune base de données trouvée dans $APP_DIR/data — rien à sauvegarder." >&2
  exit 1
fi

timestamp=$(date +%Y%m%d-%H%M%S)
archive="$BACKUP_DIR/appart-backup-$timestamp.tar.gz"

tar -czf "$archive" -C "$APP_DIR" data/appart.db data/uploads 2>/dev/null \
  || tar -czf "$archive" -C "$APP_DIR" data/appart.db

echo "Sauvegarde créée : $archive ($(du -h "$archive" | cut -f1))"

# Rotation : ne garder que les $KEEP sauvegardes les plus récentes.
ls -1t "$BACKUP_DIR"/appart-backup-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm --

echo "Sauvegardes conservées : $(ls -1 "$BACKUP_DIR"/appart-backup-*.tar.gz 2>/dev/null | wc -l)"
