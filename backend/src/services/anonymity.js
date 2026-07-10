import { firstPublicIPFromHeader, normalizeIP } from '../utils/ip.js';

/** Headers that typically leak the original client or mark a proxy hop. */
const TRANSPARENT_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'x-client-ip',
  'x-cluster-client-ip',
  'x-forwarded',
  'forwarded-for',
  'forwarded',
  'client-ip',
  'x-coming-from',
  'x-originating-ip',
  'true-client-ip',
  'x-original-forwarded-for',
];

/** Headers that indicate a proxy without necessarily revealing the client IP. */
const ANONYMOUS_HEADERS = [
  'via',
  'proxy-connection',
  'proxy-authorization',
  'x-proxy-id',
  'x-proxy-user-ip',
];

/**
 * Headers set by our own edge (nginx). When present alone they must not
 * classify the request as a transparent proxy.
 *
 * nginx passes client X-Forwarded-For through unchanged and sets X-Real-IP
 * to the TCP peer. We therefore treat X-Real-IP as infrastructure-owned
 * when it matches the connecting IP.
 */
function isInfraOwnedHeader(name, value, connectingIP) {
  if (name === 'x-real-ip') {
    const headerIP = normalizeIP(String(value).split(',')[0].trim());
    return headerIP === connectingIP;
  }
  return false;
}

/**
 * Classify proxy anonymity from request headers.
 *
 * - ELITE: no proxy-revealing headers
 * - TRANSPARENT: original client IP (or equivalent) is exposed
 * - ANONYMOUS: proxy indicators present, original IP hidden
 */
export function detectProxyAnonymity(req, connectingIP) {
  const headers = req.headers;
  let leakedClientIP = null;
  let hasTransparentSignal = false;
  let hasAnonymousSignal = false;

  for (const name of TRANSPARENT_HEADERS) {
    const value = headers[name];
    if (!value) continue;
    if (isInfraOwnedHeader(name, value, connectingIP)) continue;

    hasTransparentSignal = true;

    if (name === 'x-forwarded-for' || name === 'forwarded-for' || name === 'x-original-forwarded-for') {
      const candidate = firstPublicIPFromHeader(value);
      if (candidate && candidate !== connectingIP) {
        leakedClientIP = candidate;
      }
    } else if (name === 'forwarded') {
      // RFC 7239: for=1.2.3.4
      const match = String(value).match(/for=(?:"?\[?)([^\]";,\s]+)/i);
      if (match) {
        const candidate = normalizeIP(match[1]);
        if (candidate && candidate !== connectingIP) {
          leakedClientIP = candidate;
        }
      }
    } else {
      const candidate = firstPublicIPFromHeader(value);
      if (candidate && candidate !== connectingIP) {
        leakedClientIP = candidate;
      }
    }
  }

  for (const name of ANONYMOUS_HEADERS) {
    if (headers[name]) {
      hasAnonymousSignal = true;
    }
  }

  // X-Forwarded-For that only contains the connecting IP (nginx misconfig)
  // should not force TRANSPARENT.
  if (hasTransparentSignal && !leakedClientIP) {
    const xff = headers['x-forwarded-for'];
    if (xff) {
      const only = normalizeIP(String(xff).split(',')[0].trim());
      if (only === connectingIP && String(xff).split(',').length === 1) {
        hasTransparentSignal = false;
      }
    }
  }

  if (leakedClientIP || hasTransparentSignal) {
    return {
      level: 'TRANSPARENT',
      originalClientIP: leakedClientIP,
    };
  }

  if (hasAnonymousSignal) {
    return {
      level: 'ANONYMOUS',
      originalClientIP: null,
    };
  }

  return {
    level: 'ELITE',
    originalClientIP: null,
  };
}
