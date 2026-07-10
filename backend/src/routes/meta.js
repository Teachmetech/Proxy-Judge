import { Router } from 'express';
import { getConnectingIP } from '../utils/ip.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

router.get('/headers', (req, res) => {
  res.json({
    ip: getConnectingIP(req),
    headers: req.headers,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
});

router.options('/headers', (_req, res) => {
  res.status(204).end();
});

router.get('/', (_req, res) => {
  res.json({
    message: 'Proxy Judge API',
    version: '1.1.0',
    endpoints: {
      judge: 'GET /judge',
      headers: 'GET /headers',
      health: 'GET /health',
    },
    docs: 'https://proxy-judge.com',
  });
});

export default router;
