import dns from 'node:dns/promises';
import { config } from '../config.js';
import { isPrivateIP, normalizeIP } from '../utils/ip.js';

/**
 * Public DNSBLs commonly used for open-proxy / spam reputation checks.
 * A positive hit means the IP is listed — useful signal, not a legal verdict.
 */
const DNSBL_ZONES = [
  { name: 'zen.spamhaus.org', label: 'Spamhaus ZEN' },
  { name: 'bl.spamcop.net', label: 'SpamCop' },
  { name: 'dnsbl.sorbs.net', label: 'SORBS' },
  { name: 'b.barracudacentral.org', label: 'Barracuda' },
  { name: 'dnsbl-1.uceprotect.net', label: 'UCEPROTECT L1' },
];

function reverseIPv4(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  return parts.reverse().join('.');
}

async function queryZone(reversed, zone, timeoutMs) {
  const hostname = `${reversed}.${zone.name}`;
  let timer;
  try {
    const lookup = dns.resolve4(hostname);
    const result = await Promise.race([
      lookup,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
      }),
    ]);
    if (Array.isArray(result) && result.length > 0) {
      return { listed: true, zone: zone.label, answers: result };
    }
    return { listed: false, zone: zone.label };
  } catch (error) {
    // ENOTFOUND / ENODATA = not listed
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.code === 'EINVAL') {
      return { listed: false, zone: zone.label };
    }
    return { listed: false, zone: zone.label, error: error.message };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Check an IP against multiple DNSBLs in parallel.
 * IPv6 is skipped (most classic DNSBLs are IPv4-oriented).
 */
export async function checkBlacklists(ip) {
  const normalized = normalizeIP(ip);
  if (!normalized || isPrivateIP(normalized)) {
    return {
      blacklisted: false,
      lists: [],
      checked: 0,
      skipped: true,
      reason: 'private_or_local',
    };
  }

  // IPv6: no classic DNSBL support in this build
  if (normalized.includes(':')) {
    return {
      blacklisted: false,
      lists: [],
      checked: 0,
      skipped: true,
      reason: 'ipv6_unsupported',
    };
  }

  const reversed = reverseIPv4(normalized);
  if (!reversed) {
    return {
      blacklisted: false,
      lists: [],
      checked: 0,
      skipped: true,
      reason: 'invalid_ip',
    };
  }

  const perZoneTimeout = config.blacklistTimeoutMs;
  const results = await Promise.all(
    DNSBL_ZONES.map((zone) => queryZone(reversed, zone, perZoneTimeout)),
  );

  const hits = results.filter((r) => r.listed).map((r) => r.zone);

  return {
    blacklisted: hits.length > 0,
    lists: hits,
    checked: DNSBL_ZONES.length,
    skipped: false,
  };
}
