export const config = {
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  /** Comma-separated origins. Empty / * = allow all (public API). */
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : '*',
  /** Trust nginx / DO load balancer hop count. */
  trustProxy: process.env.TRUST_PROXY === 'false' ? false : Number(process.env.TRUST_PROXY || 1),
  geoTimeoutMs: Number(process.env.GEO_TIMEOUT_MS) || 5000,
  blacklistTimeoutMs: Number(process.env.BLACKLIST_TIMEOUT_MS) || 2500,
};
