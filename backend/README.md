# Proxy Judge Backend

Express API that judges requests routed through HTTP, HTTPS, SOCKS4, and SOCKS5 proxies: anonymity level, exit-node geolocation, DNSBL blacklist status, and timing.

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
  "TESTED_PROTOCOL": "SOCKS5",
  "TESTED_PROTOCOL_SOURCE": "CLIENT_DECLARED",
  "REQUEST_TIME": 1767932460,
  "REQUEST_TIME_FLOAT": 1767932460.134,
  "JUDGE_PROCESSING_MS": 42.15
}
```

`PROXY_ANONYMITY` is one of `ELITE`, `ANONYMOUS`, `TRANSPARENT`.

`PROXY_BLACKLIST_ERRORS` reports DNSBLs that did not produce a usable verdict.
For example, Spamhaus `127.255.255.254` is returned as
`public_resolver_blocked`; it is never counted as a reputation listing.
Set `SPAMHAUS_DQS_KEY` in the deployment `.env` to use the authenticated
`<key>.zen.dq.spamhaus.net` zone instead of the public mirror. Never commit the
real key.

`JUDGE_PROCESSING_MS` measures external lookups and server work, not proxy
speed. Client code should measure the complete HTTP round trip and subtract
`JUDGE_PROCESSING_MS` to estimate network plus proxy time. A direct-request
baseline is needed to isolate the proxy's added latency. The response also
includes a `Server-Timing` header containing the judge duration.

`TESTED_PROTOCOL` is populated only when the caller sends an allowlisted
`X-Proxy-Test-Protocol` value. It is normalized to `HTTP`, `HTTPS_CONNECT`,
`HTTPS`, `SOCKS4`, or `SOCKS5`, and `TESTED_PROTOCOL_SOURCE` is then
`CLIENT_DECLARED`. The judge cannot independently observe HTTP CONNECT or SOCKS
negotiation, so consumers must not treat this echo as server-verified evidence.

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

For HTTP-only forward proxies, also create a Cloudflare **DNS-only** `A`
record from `plain.proxy-judge.com` to the droplet. The dedicated endpoint is:

```bash
curl -x http://PROXY_HOST:PORT http://plain.proxy-judge.com/judge \
  -H 'X-Proxy-Test-Protocol: http'
```

It uses the same Express `/judge` handler as the HTTPS endpoint. The separate
nginx configuration is mounted independently so rerunning `setup-tls.sh` does
not replace it with an HTTPS redirect.

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the full droplet walkthrough.

## Environment

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `8000` | Listen port |
| `NODE_ENV` | `development` | |
| `TRUST_PROXY` | `1` | Express hop count behind nginx |
| `CORS_ORIGINS` | `*` | Comma-separated or `*` |
| `GEO_TIMEOUT_MS` | `5000` | ipapi / ip-api timeout |
| `BLACKLIST_TIMEOUT_MS` | `750` | Per-DNSBL timeout |
| `SPAMHAUS_DQS_KEY` | unset | Optional 26-character DQS credential |
| `GEO_CACHE_TTL_MS` | `3600000` | Geolocation/proxy-intelligence cache TTL |
| `BLACKLIST_CACHE_TTL_MS` | `600000` | DNSBL result cache TTL |
