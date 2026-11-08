#!/usr/bin/env bash
# Local integration test using the production nginx image and synthetic keys.
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
fixture=$(mktemp -d)
container=
cleanup() {
  if [[ -n "$container" ]]; then docker stop -t 2 "$container" >/dev/null; fi
  rm -rf -- "$fixture"
}
trap cleanup EXIT
image=nginx:1.27-alpine
mkdir -p "$fixture/live/example"
for serial in 1 2; do
  openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj '/CN=localhost' \
    -set_serial "$serial" -keyout "$fixture/key$serial" -out "$fixture/cert$serial" 2>/dev/null
done
ln -s ../../cert1 "$fixture/live/example/fullchain.pem"
ln -s ../../key1 "$fixture/live/example/privkey.pem"
cat > "$fixture/test.conf" <<'EOF'
server {
    listen 8443 ssl;
    ssl_certificate /etc/letsencrypt/live/example/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example/privkey.pem;
    location /health { return 200 'ok'; }
}
EOF
container=$(docker run --rm -d -p 127.0.0.1::8443 -e CERTIFICATE_POLL_SECONDS=1 \
  -v "$fixture:/etc/letsencrypt:ro" -v "$fixture/test.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$root/deploy/nginx/watch-certificates.sh:/docker-entrypoint.d/45-watch-certificates.sh:ro" "$image")
address=$(docker port "$container" 8443)
await_serial() {
  for _ in {1..15}; do
    actual=$(openssl s_client -connect "$address" -servername localhost </dev/null 2>/dev/null \
      | openssl x509 -noout -serial 2>/dev/null) || true
    [[ "$actual" != "serial=$1" ]] || return 0
    sleep 1
  done
  echo "Expected TLS serial $1, last received '$actual'" >&2
  docker logs --tail 15 "$container" >&2
  return 1
}
await_serial 01
# Like Certbot, a separate container updates symlinks on the shared volume.
docker run --rm -v "$fixture:/acme" --entrypoint ln "$image" -snf ../../cert2 /acme/live/example/fullchain.pem
sleep 3
await_serial 01
docker run --rm -v "$fixture:/acme" --entrypoint ln "$image" -snf ../../key2 /acme/live/example/privkey.pem
await_serial 02
echo 'New TLS connections receive the renewed certificate.'
