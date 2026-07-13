import { Router } from 'express';
import { getConnectingIP } from '../utils/ip.js';
import { detectProxyAnonymity } from '../services/anonymity.js';
import { getGeolocation } from '../services/geolocation.js';
import { checkBlacklists } from '../services/blacklist.js';

const router = Router();

/**
 * GET /judge
 * Hit this endpoint through the proxy under test.
 * Returns anonymity, exit-node geo, blacklist status, and timing.
 */
router.get('/judge', async (req, res) => {
  const started = process.hrtime.bigint();
  const requestTimeFloat = Date.now() / 1000;
  const requestTime = Math.floor(requestTimeFloat);

  try {
    const connectingIP = getConnectingIP(req);

    const [location, blacklist] = await Promise.all([
      getGeolocation(connectingIP),
      checkBlacklists(connectingIP),
    ]);
    const anonymity = detectProxyAnonymity(req, connectingIP, {
      proxyDetected: location.proxyDetected,
    });

    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
    const roundedElapsedMs = Math.round(elapsedMs * 100) / 100;
    res.set('Server-Timing', `judge;dur=${roundedElapsedMs}`);
    res.set('Timing-Allow-Origin', '*');

    res.json({
      PROXY_IP: connectingIP,
      PROXY_ANONYMITY: anonymity.level,
      PROXY_DETECTED: anonymity.proxyDetected,
      PROXY_COUNTRY: location.country,
      PROXY_CITY: location.city,
      PROXY_REGION: location.region,
      PROXY_LATITUDE: location.latitude,
      PROXY_LONGITUDE: location.longitude,
      PROXY_ISP: location.isp,
      PROXY_ORG: location.org,
      PROXY_TIMEZONE: location.timezone,
      PROXY_BLACKLISTED: blacklist.blacklisted,
      PROXY_BLACKLIST_COUNT: blacklist.lists.length,
      PROXY_BLACKLISTS: blacklist.lists,
      PROXY_BLACKLIST_CHECKED: blacklist.checked,
      PROXY_BLACKLIST_ATTEMPTED: blacklist.attempted,
      PROXY_BLACKLIST_ERRORS: blacklist.errors,
      ORIGINAL_CLIENT_IP: anonymity.originalClientIP,
      REQUEST_TIME: requestTime,
      REQUEST_TIME_FLOAT: requestTimeFloat,
      JUDGE_PROCESSING_MS: roundedElapsedMs,
    });
  } catch (error) {
    console.error('Judge error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
  }
});

router.options('/judge', (_req, res) => {
  res.status(204).end();
});

export default router;
