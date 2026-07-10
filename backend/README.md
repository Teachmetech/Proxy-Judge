# Proxy Judge Backend

Express API that judges HTTP proxies: anonymity level, exit-node geolocation, DNSBL blacklist status, and timing.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/judge` | Main verdict (call **through** the proxy under test) |
| `GET` | `/headers` | Echo connecting IP + raw headers (debug) |
| `GET` | `/health` | Health check |
| `GET` | `/` | API info |

### `GET /judge` response

```json
{
  "PROXY_IP": "203.0.113.50",
  "PROXY_ANONYMITY": "ELITE",
  "PROXY_COUNTRY": "US",
  "PROXY_CITY": "New York",
  "PROXY_REGION": "New York",
  "PROXY_LATITUDE": 40.71,
  "PROXY_LONGITUDE": -74.0,
  "PROXY_ISP": "Example ISP",
  "PROXY_ORG": "Example Org",
  "PROXY_TIMEZONE": "America/New_York",
  "PROXY_BLACKLISTED": false,
  "PROXY_BLACKLIST_COUNT": 0,
  "PROXY_BLACKLISTS": [],
  "ORIGINAL_CLIENT_IP": null,
  "REQUEST_TIME": 1767932460,
  "REQUEST_TIME_FLOAT": 1767932460.134,
  "JUDGE_PROCESSING_MS": 42.15
}
```

`PROXY_ANONYMITY` is one of `ELITE`, `ANONYMOUS`, `TRANSPARENT`.

## Local development

```bash
cd backend
pnpm install
pnpm dev
# → http://localhost:8000/judge
```

```bash
curl http://localhost:8000/judge
curl -x http://user:pass@PROXY_HOST:PORT http://localhost:8000/judge
```

## Docker (DigitalOcean)

From the **repo root**:

```bash
cp .env.example .env
./deploy/deploy.sh
```

Then point `api.proxy-judge.com` A record at the droplet and:

```bash
EMAIL=you@example.com ./deploy/setup-tls.sh
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the full droplet walkthrough.

## Environment

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `8000` | Listen port |
| `NODE_ENV` | `development` | |
| `TRUST_PROXY` | `1` | Express hop count behind nginx |
| `CORS_ORIGINS` | `*` | Comma-separated or `*` |
| `GEO_TIMEOUT_MS` | `5000` | ipapi / ip-api timeout |
| `BLACKLIST_TIMEOUT_MS` | `2500` | Per-DNSBL timeout |
