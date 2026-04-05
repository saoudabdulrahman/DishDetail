import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { pino } from 'pino';
import pinoHttp from 'pino-http';
import { connectDb } from './model/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import establishmentRoutes from './routes/establishments.js';
import reviewRoutes from './routes/reviews.js';

dotenv.config();

// Entry point for the DishDetail Express server.
// Sets up database connections, shared middleware, and primary API routes.
const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

await connectDb(process.env.MONGODB_URI);

// Standard middleware stack: CORS for cross-origin client requests
// and JSON parsing with a 2mb limit to accommodate base64 review images.
app.use(helmet());
app.use(pinoHttp({ logger }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// API routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    error: 'Too many requests from this IP, please try again in 15 minutes.',
  },
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/establishments', establishmentRoutes);
app.use('/api/reviews', reviewRoutes);

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
