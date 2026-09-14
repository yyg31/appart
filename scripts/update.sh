#!/usr/bin/env bash
# Backs up the database, pulls the latest code, and rebuilds/restarts
# the Docker containers. Run this for every future update instead of
# doing each step by hand.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> Sauvegarde avant mise à jour"
bash scripts/backup.sh

echo "==> Récupération du code"
git pull

echo "==> Reconstruction et redémarrage des conteneurs"
sudo docker compose up -d --build

echo "==> Terminé."
