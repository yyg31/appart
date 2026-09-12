#!/usr/bin/env bash
# Provisions a fresh Ubuntu VPS to run the Appart app for two people:
# firewall, Node.js, pm2, Caddy reverse proxy with automatic HTTPS via
# nip.io, and a shared basic-auth password protecting the app.
set -euo pipefail

REPO_URL="https://github.com/yyg31/appart.git"
APP_DIR="$HOME/appart"

echo "==> Pare-feu"
sudo apt update
sudo apt install -y ufw curl gnupg
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw --force enable

echo "==> Node.js + outils de build"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs build-essential git
sudo npm install -g pm2

echo "==> Caddy"
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

echo "==> Déploiement de l'application"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi
npm install
npm run build

if pm2 describe appart > /dev/null 2>&1; then
  pm2 restart appart
else
  pm2 start npm --name appart -- start
fi
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash

echo "==> Configuration de Caddy (HTTPS via nip.io + mot de passe partagé)"
detect_ip() {
  for url in "https://ifconfig.me" "https://icanhazip.com" "https://api.ipify.org" "https://ipinfo.io/ip"; do
    ip=$(curl -4 -fsS --max-time 5 --retry 2 "$url" 2>/dev/null | tr -d '[:space:]') || true
    if [[ "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
      echo "$ip"
      return 0
    fi
  done
  return 1
}

if ! IP=$(detect_ip); then
  echo "Impossible de détecter automatiquement l'IP publique (réseau indisponible ?)." >&2
  echo "Relancez ce script, ou configurez Caddy manuellement avec votre IP." >&2
  exit 1
fi
CADDYFILE_HOST="${IP}.nip.io"

if [ -f /etc/caddy/Caddyfile ] && grep -q "nip.io" /etc/caddy/Caddyfile 2>/dev/null; then
  echo "Caddyfile déjà configuré, on ne touche pas au mot de passe existant."
else
  PASSWORD=$(openssl rand -base64 12)
  HASH=$(caddy hash-password --plaintext "$PASSWORD")
  sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
${CADDYFILE_HOST} {
    basic_auth {
        couple ${HASH}
    }
    reverse_proxy localhost:3000
}
EOF
  echo "=================================================="
  echo "URL:          https://${CADDYFILE_HOST}"
  echo "Identifiant:  couple"
  echo "Mot de passe: ${PASSWORD}"
  echo "=================================================="
  echo "Notez ces informations maintenant, elles ne seront plus réaffichées."
fi

sudo systemctl reload caddy
echo "==> Terminé."
