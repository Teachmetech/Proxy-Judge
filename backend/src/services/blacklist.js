import dns from 'node:dns/promises';
import { config } from '../config.js';
import { isPrivateIP, normalizeIP } from '../utils/ip.js';

/**
 * Public DNSBLs commonly used for open-proxy / spam reputation checks.
 * A positive hit means the IP is listed — useful signal, not a legal verdict.
 */
const DNSBL_ZONES = [
  { name: 'zen.spamhaus.org', label: 'Spamhaus ZEN', provider: 'spamhaus' },
  { name: 'bl.spamcop.net', label: 'SpamCop' },
  { name: 'dnsbl.sorbs.net', label: 'SORBS' },
  { name: 'b.barracudacentral.org', label: 'Barracuda' },
  { name: 'dnsbl-1.uceprotect.net', label: 'UCEPROTECT L1' },
];

const SPAMHAUS_ERROR_CODES = {
  '127.255.255.252': 'invalid_zone',
  '127.255.255.254': 'public_resolver_blocked',
  '127.255.255.255': 'rate_limited',
};

const blacklistCache = new Map();

function getCachedResult(ip) {
  const cached = blacklistCache.get(ip);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    blacklistCache.delete(ip);
    return null;
  }
  return cached.value;
}

function cacheResult(ip, value) {
  if (blacklistCache.size >= 5000) {
    blacklistCache.delete(blacklistCache.keys().next().value);
  }
  blacklistCache.set(ip, {
    value,
    expiresAt: Date.now() + config.blacklistCacheTtlMs,
  });
  return value;
}

function reverseIPv4(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  return parts.reverse().join('.');
}

/**
 * Interpret DNSBL A records. A DNS response is not automatically a listing:
 * Spamhaus uses 127.255.255.0/24 for lookup failures, and those responses must
 * never affect an IP's reputation verdict.
 */
export function interpretDnsblAnswers(zone, answers) {
  const records = Array.isArray(answers) ? answers : [];
  const errorRecords = zone.provider === 'spamhaus'
    ? records.filter((answer) => SPAMHAUS_ERROR_CODES[answer])
    : [];
  const listingRecords = records.filter(
    (answer) => answer.startsWith('127.') && !errorRecords.includes(answer),
  );

  if (listingRecords.length > 0) {
    return { listed: true, answers: listingRecords };
  }

  if (errorRecords.length > 0) {
    const answer = errorRecords[0];
    return {
      listed: false,
      error: SPAMHAUS_ERROR_CODES[answer],
      answers: errorRecords,
    };
  }

  if (records.length > 0) {
    return { listed: false, error: 'unexpected_answer', answers: records };
  }

  return { listed: false };
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
    return { zone: zone.label, ...interpretDnsblAnswers(zone, result) };
  } catch (error) {
    // ENOTFOUND / ENODATA = not listed
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.code === 'EINVAL') {
      return { listed: false, zone: zone.label };
    }
    return {
      listed: false,
      zone: zone.label,
      error: error.message === 'timeout' ? 'timeout' : 'lookup_failed',
    };
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
      attempted: 0,
      errors: [],
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
      attempted: 0,
      errors: [],
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
      attempted: 0,
      errors: [],
      skipped: true,
      reason: 'invalid_ip',
    };
  }

  const cached = getCachedResult(normalized);
  if (cached) return cached;

  const perZoneTimeout = config.blacklistTimeoutMs;
  const results = await Promise.all(
    DNSBL_ZONES.map((zone) => queryZone(reversed, zone, perZoneTimeout)),
  );

  const hits = results.filter((r) => r.listed).map((r) => r.zone);
  const errors = results
    .filter((result) => result.error)
    .map((result) => ({
      list: result.zone,
      code: result.error,
      ...(result.answers ? { answers: result.answers } : {}),
    }));

  return cacheResult(normalized, {
    blacklisted: hits.length > 0,
    lists: hits,
    checked: results.filter((result) => !result.error).length,
    attempted: DNSBL_ZONES.length,
    errors,
    skipped: false,
  });
}
