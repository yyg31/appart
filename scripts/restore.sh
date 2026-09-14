#!/usr/bin/env bash
# Restores data/appart.db and data/uploads/ from a backup archive
# created by backup.sh. Without an argument, restores the most recent
# backup found in ../appart-backups.
# Usage: ./scripts/restore.sh [chemin/vers/appart-backup-XXXX.tar.gz]
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$APP_DIR/../appart-backups"

archive="${1:-}"
if [ -z "$archive" ]; then
  archive=$(ls -1t "$BACKUP_DIR"/appart-backup-*.tar.gz 2>/dev/null | head -n1)
fi
if [ -z "$archive" ] || [ ! -f "$archive" ]; then
  echo "Aucune sauvegarde trouvée dans $BACKUP_DIR. Précisez un chemin explicite." >&2
  exit 1
fi

echo "Restauration depuis : $archive"
read -r -p "Ceci va remplacer data/appart.db actuel. Continuer ? (o/N) " confirm
if [ "$confirm" != "o" ] && [ "$confirm" != "O" ]; then
  echo "Annulé."
  exit 0
fi

cd "$APP_DIR"
if [ -f docker-compose.yml ] && command -v docker &> /dev/null; then
  sudo docker compose stop app || true
fi

tar -xzf "$archive" -C "$APP_DIR"
echo "Restauration terminée."

if [ -f docker-compose.yml ] && command -v docker &> /dev/null; then
  sudo docker compose start app || true
fi
