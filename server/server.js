import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { pino } from 'pino';
import pinoHttp from 'pino-http';
import { validateServerConfig } from './utils/config.js';
import { connectDb } from './model/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import establishmentRoutes from './routes/establishments.js';
import reviewRoutes from './routes/reviews.js';
import uploadRoutes from './routes/upload.js';

// Entry point for the DishDetail Express server.
// Sets up database connections, shared middleware, and primary API routes.
const app = express();
const PORT = process.env.PORT || 3000;
const config = validateServerConfig(process.env);
const usePrettyLogging =
  process.env.NODE_ENV !== 'production' && process.stdout.isTTY;

const logger = pino(
  usePrettyLogging ?
    {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
    }
  : {},
);

await connectDb(config.mongoUri);

// Standard middleware stack: CORS for cross-origin client requests
// and JSON parsing for standard API payloads.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
      },
    },
  }),
);
app.use(pinoHttp({ logger }));
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// API routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: 'Too many requests from this IP, please try again in 15 minutes.',
  },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  skip: (req) => !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method),
  message: {
    error: 'Too many write requests from this IP, please try again later.',
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: {
    error: 'Too many upload requests from this IP, please try again later.',
  },
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', writeLimiter, userRoutes);
app.use('/api/establishments', writeLimiter, establishmentRoutes);
app.use('/api/reviews', writeLimiter, reviewRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);

app.use((err, req, res, _next) => {
  const status = err.status ?? 500;
  // Only surface the message for intentional HTTP errors (4xx).
  // For unexpected server errors, send a generic message to avoid
  // leaking internals (stack traces, DB query strings, file paths, etc.).
  const message =
    status < 500 ? (err.message ?? 'Bad request.') : 'Internal error.';
  const log = req.log?.error ? req.log : logger;
  log.error({ err, status }, err.message || 'Internal error');
  res.status(status).json({ error: message });
});

const server = app.listen(PORT, () => {
  logger.info(`DishDetail API server running on http://localhost:${PORT}`);
});

const shutdown = () => {
  logger.info('Shutdown signal received: closing server');
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
