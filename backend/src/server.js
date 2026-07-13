import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import judgeRouter from './routes/judge.js';
import metaRouter from './routes/meta.js';

const app = express();

app.set('trust proxy', config.trustProxy);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const corsOptions =
  config.corsOrigins === '*' ||
  (Array.isArray(config.corsOrigins) && config.corsOrigins.includes('*'))
    ? { origin: true, exposedHeaders: ['Server-Timing'] }
    : { origin: config.corsOrigins, exposedHeaders: ['Server-Timing'] };

app.use(cors(corsOptions));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '32kb' }));

app.use(judgeRouter);
app.use(metaRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Proxy Judge API listening on 0.0.0.0:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
