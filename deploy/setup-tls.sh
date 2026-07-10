#!/usr/bin/env bash
# Bootstrap TLS for api.proxy-judge.com on a DigitalOcean droplet.
# Prerequisites: DNS A record → droplet IP, ports 80/443 open, docker compose stack running.
set -euo pipefail

DOMAIN="${DOMAIN:-api.proxy-judge.com}"
EMAIL="${EMAIL:?Set EMAIL=you@example.com}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p deploy/certbot/conf deploy/certbot/www deploy/nginx/ssl

# Ensure HTTP-only nginx is active for ACME
cp deploy/nginx/http-only.conf deploy/nginx/default.conf
docker compose up -d --build
docker compose exec nginx nginx -s reload || true

echo "Requesting certificate for ${DOMAIN}..."
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

# Switch nginx to TLS config
cat > deploy/nginx/default.conf <<EOF
upstream proxy_judge_api {
    server api:8000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$http_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Connection        "";
        proxy_connect_timeout 5s;
        proxy_send_timeout    30s;
        proxy_read_timeout    30s;
        proxy_pass http://proxy_judge_api;
    }
}
EOF

docker compose up -d nginx
docker compose exec nginx nginx -s reload

# Start renewer
docker compose --profile tls up -d certbot

echo "Done. Test: curl https://${DOMAIN}/judge"
