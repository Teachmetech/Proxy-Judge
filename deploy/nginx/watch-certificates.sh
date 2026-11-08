#!/bin/sh
# The nginx image runs executable entrypoint scripts before starting its master.
# Certbot replaces files on the shared volume; the master holds its old TLS
# context until a graceful reload.
certificate_digests() {
    for chain in /etc/letsencrypt/live/*/fullchain.pem; do
        [ -f "$chain" ] || continue
        sha256sum "$chain" || return 1
    done
}

loaded=$(certificate_digests) || loaded=
while sleep "${CERTIFICATE_POLL_SECONDS:-300}"; do
    current=$(certificate_digests) || continue
    [ -n "$current" ] && [ "$current" != "$loaded" ] || continue
    if nginx -t && nginx -s reload; then
        loaded=$current
    fi
done &
