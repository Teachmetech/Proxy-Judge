# Deploying Proxy Judge API on DigitalOcean

Stack: **Docker Compose** → `api` (Node/Express) + `nginx` (+ optional `certbot`).

Target domain: `api.proxy-judge.com`

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

Create an **A** record:

```
api.proxy-judge.com  →  <droplet public IP>
```

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
```

## 5. Updates

```bash
cd Proxy-Judge
git pull
docker compose up -d --build
```

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

## Frontend

The Vite app expects:

- Dev: `http://localhost:8000/judge`
- Prod: `https://api.proxy-judge.com/judge`

Deploy the frontend separately (e.g. Vercel → `proxy-judge.com`).
