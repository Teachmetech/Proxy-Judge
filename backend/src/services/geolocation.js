import { config } from '../config.js';
import { isPrivateIP } from '../utils/ip.js';

const locationCache = new Map();

function getCachedLocation(ip) {
  const cached = locationCache.get(ip);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    locationCache.delete(ip);
    return null;
  }
  return cached.value;
}

function cacheLocation(ip, value) {
  if (locationCache.size >= 5000) {
    locationCache.delete(locationCache.keys().next().value);
  }
  locationCache.set(ip, {
    value,
    expiresAt: Date.now() + config.geoCacheTtlMs,
  });
  return value;
}

async function fetchJSON(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ProxyJudge/1.1 (+https://proxy-judge.com)',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function emptyLocation(overrides = {}) {
  return {
    country: 'UNKNOWN',
    countryName: null,
    region: null,
    city: 'Unknown',
    latitude: null,
    longitude: null,
    isp: null,
    org: null,
    timezone: null,
    proxyDetected: null,
    hosting: null,
    ...overrides,
  };
}

async function fromIpapi(ip) {
  const data = await fetchJSON(`https://ipapi.co/${ip}/json/`, config.geoTimeoutMs);
  if (data.error) {
    throw new Error(data.reason || 'ipapi.co error');
  }
  return {
    country: data.country_code || 'UNKNOWN',
    countryName: data.country_name || null,
    region: data.region || null,
    city: data.city || 'Unknown',
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    isp: data.org || null,
    org: data.org || null,
    timezone: data.timezone || null,
    proxyDetected: null,
    hosting: null,
  };
}

async function fromIpApiCom(ip) {
  const fields = [
    'status',
    'message',
    'country',
    'countryCode',
    'regionName',
    'city',
    'lat',
    'lon',
    'timezone',
    'isp',
    'org',
    'proxy',
    'hosting',
    'query',
  ].join(',');

  const data = await fetchJSON(
    `http://ip-api.com/json/${ip}?fields=${fields}`,
    config.geoTimeoutMs,
  );

  if (data.status !== 'success') {
    throw new Error(data.message || 'ip-api.com error');
  }

  return {
    country: data.countryCode || 'UNKNOWN',
    countryName: data.country || null,
    region: data.regionName || null,
    city: data.city || 'Unknown',
    latitude: data.lat ?? null,
    longitude: data.lon ?? null,
    isp: data.isp || null,
    org: data.org || null,
    timezone: data.timezone || null,
    proxyDetected: data.proxy ?? null,
    hosting: data.hosting ?? null,
  };
}

/**
 * Resolve geolocation for a public IP. Private IPs get a local stub.
 */
export async function getGeolocation(ip) {
  if (isPrivateIP(ip)) {
    return emptyLocation({
      country: 'US',
      countryName: 'United States',
      city: 'Local Development',
      isp: 'Local',
      org: 'Local',
    });
  }

  const cached = getCachedLocation(ip);
  if (cached) return cached;

  // ip-api includes a dedicated proxy/VPN/Tor signal used by the anonymity
  // classifier. Generic hosting alone is not treated as proof of proxy use.
  try {
    return cacheLocation(ip, await fromIpApiCom(ip));
  } catch (error) {
    console.error('Primary geolocation error:', error.message);
  }

  try {
    return cacheLocation(ip, await fromIpapi(ip));
  } catch (error) {
    console.error('Fallback geolocation error:', error.message);
  }

  return emptyLocation();
}
