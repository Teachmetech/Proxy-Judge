# Deploying Proxy Judge API on DigitalOcean

Stack: **Docker Compose** → `api` (Node/Express) + `nginx` (+ optional `certbot`).

Target domains:

- `api.proxy-judge.com` — HTTPS API; port 80 redirects to HTTPS.
- `plain.proxy-judge.com` — deliberately plain-HTTP judge for HTTP-only
  forward proxies; never redirects.

## 1. Droplet

1. Create an Ubuntu 24.04 droplet (1 GB RAM is enough to start).
2. Open firewall ports **22**, **80**, **443**.
3. SSH in and install Docker:

```bash
apt update && apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sh
```

## 2. Clone and boot (HTTP)

```bash
git clone <your-repo-url> Proxy-Judge
cd Proxy-Judge
cp .env.example .env
chmod +x deploy/*.sh
./deploy/deploy.sh
```

Smoke test from the droplet:

```bash
curl http://127.0.0.1/health
curl http://127.0.0.1/judge
```

## 3. DNS

Create these **A** records:

```
api.proxy-judge.com    →  <droplet public IP>
plain.proxy-judge.com  →  <droplet public IP>
```

In Cloudflare, `plain.proxy-judge.com` must use **DNS only** (gray cloud), not
Proxied (orange cloud). A DNS-only record sends the request directly to nginx,
which both prevents Cloudflare redirect rules from upgrading it to HTTPS and
lets nginx observe the tested proxy's exit IP as the TCP peer. Do not create it
as a CNAME to a proxied hostname.

Use a sibling hostname exactly as shown. Do not use
`plain.api.proxy-judge.com`: the HTTPS API sends an HSTS policy with
`includeSubDomains`, which can cause compatible clients to upgrade descendants
of `api.proxy-judge.com` to HTTPS before making a request.

Wait for propagation, then:

```bash
curl http://api.proxy-judge.com/health
```

## 4. TLS (Let's Encrypt)

```bash
EMAIL=you@example.com ./deploy/setup-tls.sh
```

Verify:

```bash
curl https://api.proxy-judge.com/judge
curl -x http://user:pass@PROXY:PORT https://api.proxy-judge.com/judge
curl -i http://plain.proxy-judge.com/judge \
  -H 'X-Proxy-Test-Protocol: http'
curl -i -x http://user:pass@PROXY:PORT \
  http://plain.proxy-judge.com/judge \
  -H 'X-Proxy-Test-Protocol: http'
```

Both plain-HTTP commands must return `200`, not `301`, `302`, `307`, or `308`.
The proxied request should return the complete JSON verdict, including
`PROXY_ANONYMITY`, `PROXY_COUNTRY`, `PROXY_ISP`, and blacklist fields.

To test the nginx virtual host before publishing DNS, run this from another
machine, substituting the droplet IP:

```bash
curl -i --resolve plain.proxy-judge.com:80:DROPLET_IP \
  http://plain.proxy-judge.com/judge \
  -H 'X-Proxy-Test-Protocol: http'
```

## 5. Updates

```bash
cd Proxy-Judge
git pull
docker compose config --quiet
docker compose run --rm --no-deps nginx nginx -t
docker compose up -d --build
docker compose exec nginx nginx -t
```

The plain-HTTP virtual host lives in `deploy/nginx/plain-http.conf` and is
mounted separately from `default.conf`. This is intentional: `setup-tls.sh`
regenerates `default.conf`, while the plain endpoint must survive TLS setup and
certificate renewals unchanged.

## Spamhaus DQS (recommended on DigitalOcean)

DigitalOcean's shared DNS resolver is blocked by the Spamhaus public mirror.
Add your 26-character DQS key only to the droplet's `.env`:

```env
SPAMHAUS_DQS_KEY=your_26_character_dqs_key
```

Then rebuild the API with `docker compose up -d --build api`. Do not add the
real key to `.env.example` or commit it to Git.

## Important nginx behavior

nginx sets `X-Real-IP` to the TCP peer (proxy exit IP) and **passes `X-Forwarded-For` through unchanged**. That lets `/judge` classify elite vs transparent proxies correctly. Do not switch to `$proxy_add_x_forwarded_for` for this service.

Do not enable Cloudflare proxying, Always Use HTTPS, or an HTTP-to-HTTPS
redirect for `plain.proxy-judge.com`. A checker should also disable redirect
following for this request and treat any `3xx` response as a failed HTTP probe.

## Frontend

The Vite app expects:

- Dev: `http://localhost:8000/judge`
- Prod: `https://api.proxy-judge.com/judge`

Deploy the frontend separately (e.g. Vercel → `proxy-judge.com`).
