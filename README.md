# Proxy Judge

Free HTTP proxy testing API. Route a request through your proxy to the judge and get back anonymity level, exit-node location, blacklist status, and timing — as JSON. No API keys, no signup.

- **Site:** [proxy-judge.com](https://proxy-judge.com)
- **API:** [api.proxy-judge.com](https://api.proxy-judge.com)

## Features

- **Anonymity classification** — `ELITE`, `ANONYMOUS`, or `TRANSPARENT` from request headers
- **Exit-node geolocation** — country, city, region, coordinates, ISP / org
- **DNSBL blacklist checks** — Spamhaus, SpamCop, SORBS, Barracuda, UCEPROTECT
- **Timing** — Unix timestamps plus server processing time
- **Zero auth** — public `GET` endpoint

## Quick example

Call the judge **through** the proxy under test (not from your browser alone):

```bash
curl -x http://user:pass@HOST:PORT \
  "https://api.proxy-judge.com/judge" \
  -H "Accept: application/json"
```

Example response:

```json
{
  "PROXY_IP": "203.0.113.50",
  "PROXY_ANONYMITY": "ELITE",
  "PROXY_DETECTED": false,
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
  "PROXY_BLACKLIST_CHECKED": 5,
  "PROXY_BLACKLIST_ATTEMPTED": 5,
  "PROXY_BLACKLIST_ERRORS": [],
  "ORIGINAL_CLIENT_IP": null,
  "REQUEST_TIME": 1767932460,
  "REQUEST_TIME_FLOAT": 1767932460.134,
  "JUDGE_PROCESSING_MS": 42.15
}
```

| Field | Meaning |
|-------|---------|
| `PROXY_ANONYMITY` | `ELITE` / `ANONYMOUS` / `TRANSPARENT` |
| `PROXY_DETECTED` | Whether headers or IP intelligence revealed proxy use |
| `PROXY_IP` | Exit IP the judge saw |
| `PROXY_COUNTRY` / `PROXY_CITY` | Geo of the exit node |
| `PROXY_BLACKLISTED` | `true` if listed on any checked DNSBL |
| `PROXY_BLACKLIST_ERRORS` | Lists that could not return a reputation verdict |
| `ORIGINAL_CLIENT_IP` | Leaked client IP when anonymity is `TRANSPARENT` |
| `REQUEST_TIME` | Unix timestamp (seconds) when the request hit the judge |
| `JUDGE_PROCESSING_MS` | Time spent inside the judge; not proxy latency |

## Measuring proxy speed

The server cannot know when its response arrives back at the caller, so proxy
round-trip time cannot truthfully be embedded in that same response. Measure the
request around your HTTP call, then separate judge work from network/proxy time:

```text
network + proxy time ≈ client round trip time - JUDGE_PROCESSING_MS
```

The live tester displays all three values. To estimate the proxy's added cost,
compare its network time with a direct request from the same client. The API also
sends `Server-Timing: judge;dur=...` for clients that support that standard.

More endpoints and env vars: [backend/README.md](./backend/README.md)

## Project layout

```
Proxy-Judge/
├── frontend/          # React + Vite marketing site
├── backend/           # Express API
├── deploy/            # nginx + DigitalOcean helpers
├── docker-compose.yml # API + nginx stack
└── DEPLOYMENT.md      # Droplet / TLS guide
```

## Local development

**Requirements:** Node.js 20+, [pnpm](https://pnpm.io)

```bash
pnpm install

# both apps
pnpm dev

# or separately
pnpm dev:backend    # http://localhost:8000
pnpm dev:frontend   # http://localhost:3000
```

```bash
curl http://localhost:8000/judge
curl -x http://user:pass@HOST:PORT http://localhost:8000/judge
```

Copy [`.env.example`](./.env.example) to `.env` only if you change defaults. Never commit `.env`.

## Production (DigitalOcean)

The API runs as Docker containers on a droplet behind nginx.

```bash
cp .env.example .env
./deploy/deploy.sh

# after DNS A record for api.proxy-judge.com → droplet IP
EMAIL=you@example.com ./deploy/setup-tls.sh
```

Full walkthrough: [DEPLOYMENT.md](./DEPLOYMENT.md)

Frontend can be deployed separately (e.g. Vercel) to `proxy-judge.com`.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/judge` | Main verdict (use via proxy) |
| `GET` | `/headers` | Connecting IP + raw headers (debug) |
| `GET` | `/health` | Health check |
| `GET` | `/` | API info |

## License

[MIT](./LICENSE) © 2026 Varand Abrahamian
