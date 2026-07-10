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
    const anonymity = detectProxyAnonymity(req, connectingIP);

    const [location, blacklist] = await Promise.all([
      getGeolocation(connectingIP),
      checkBlacklists(connectingIP),
    ]);

    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;

    res.json({
      PROXY_IP: connectingIP,
      PROXY_ANONYMITY: anonymity.level,
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
      ORIGINAL_CLIENT_IP: anonymity.originalClientIP,
      REQUEST_TIME: requestTime,
      REQUEST_TIME_FLOAT: requestTimeFloat,
      JUDGE_PROCESSING_MS: Math.round(elapsedMs * 100) / 100,
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
