import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
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

await connectDb(process.env.MONGODB_URI);

// Standard middleware stack: CORS for cross-origin client requests
// and JSON parsing with a 2mb limit to accommodate base64 review images.
app.use(helmet());
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

const server = app.listen(PORT, () => {
  console.warn(`DishDetail API server running on http://localhost:${PORT}`);
});

const shutdown = () => {
  console.warn('Shutdown signal received: closing server');
  server.close(async () => {
    await mongoose.connection.close();
    console.warn('Database connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
