const PROTOCOL_ALIASES = new Map([
  ['http', 'HTTP'],
  ['http_connect', 'HTTPS_CONNECT'],
  ['https_connect', 'HTTPS_CONNECT'],
  ['connect', 'HTTPS_CONNECT'],
  ['https', 'HTTPS'],
  ['https_proxy', 'HTTPS'],
  ['tls_proxy', 'HTTPS'],
  ['socks4', 'SOCKS4'],
  ['socks5', 'SOCKS5'],
  ['socks5h', 'SOCKS5'],
]);

/**
 * Normalizes a caller-declared test transport. The destination server cannot
 * independently see HTTP CONNECT or SOCKS negotiation, so this is deliberately
 * treated as metadata supplied by the checker rather than a judge verdict.
 */
export function getTestProtocol(value) {
  if (typeof value !== 'string') return null;
  return PROTOCOL_ALIASES.get(value.trim().toLowerCase()) ?? null;
}
