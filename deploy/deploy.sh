#!/usr/bin/env bash
# First-boot deploy on a fresh DigitalOcean droplet (Ubuntu 22.04/24.04).
# Run as root or with sudo from the cloned repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit if needed."
fi

# Use HTTP-only nginx until TLS is configured
mkdir -p deploy/certbot/conf deploy/certbot/www deploy/nginx/ssl
cp -n deploy/nginx/http-only.conf deploy/nginx/default.conf 2>/dev/null || \
  cp deploy/nginx/http-only.conf deploy/nginx/default.conf

# Dummy certs so the TLS-ready default.conf can start if used later
if [[ ! -f deploy/nginx/ssl/dummy.crt ]]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout deploy/nginx/ssl/dummy.key \
    -out deploy/nginx/ssl/dummy.crt \
    -subj "/CN=localhost" 2>/dev/null || true
fi

docker compose up -d --build

echo ""
echo "API is up. Health check:"
curl -sf "http://127.0.0.1/health" | head -c 200 || curl -sf "http://127.0.0.1:80/health" || true
echo ""
echo "Next: point DNS A record for api.proxy-judge.com here, then:"
echo "  EMAIL=you@example.com ./deploy/setup-tls.sh"
echo ""
echo "For HTTP-only proxies, also create this Cloudflare DNS record:"
echo "  plain.proxy-judge.com -> this droplet (A record, DNS only / gray cloud)"
echo "The dedicated endpoint will be: http://plain.proxy-judge.com/judge"
