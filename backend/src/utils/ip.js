/**
 * Private / loopback / link-local ranges — skip external geo & DNSBL.
 */
export function isPrivateIP(ip) {
  if (!ip) return true;
  const normalized = normalizeIP(ip);
  if (!normalized) return true;

  if (normalized === '127.0.0.1' || normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:')) {
    return true;
  }

  const parts = normalized.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    // Treat unknown / IPv6 public as non-private for geo attempts
    return normalized.includes(':') && (
      normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') ||
      normalized.startsWith('::ffff:192.168.')
    );
  }

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 0) return true;
  return false;
}

/** Strip IPv6-mapped IPv4 prefix and brackets. */
export function normalizeIP(ip) {
  if (!ip || typeof ip !== 'string') return null;
  let value = ip.trim().toLowerCase();
  if (value.startsWith('[') && value.endsWith(']')) {
    value = value.slice(1, -1);
  }
  if (value.startsWith('::ffff:')) {
    value = value.slice(7);
  }
  // Drop optional port on IPv4 host:port (not for IPv6)
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(value)) {
    value = value.split(':')[0];
  }
  return value || null;
}

/**
 * Connecting peer IP as seen by the edge (nginx X-Real-IP) or the socket.
 * This is the proxy exit node when the client routes through a proxy.
 */
export function getConnectingIP(req) {
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    const first = String(realIP).split(',')[0].trim();
    const normalized = normalizeIP(first);
    if (normalized) return normalized;
  }

  // Express trust proxy may populate req.ip from X-Forwarded-For — prefer socket
  // when we intentionally do not rewrite XFF (see nginx config).
  const candidates = [
    req.socket?.remoteAddress,
    req.connection?.remoteAddress,
    req.ip,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeIP(candidate);
    if (normalized) return normalized;
  }

  return '127.0.0.1';
}

/**
 * First public IP in a comma-separated header list, if any.
 */
export function firstPublicIPFromHeader(value) {
  if (!value) return null;
  const parts = String(value).split(',').map((p) => normalizeIP(p.trim())).filter(Boolean);
  for (const ip of parts) {
    if (!isPrivateIP(ip)) return ip;
  }
  return parts[0] || null;
}
