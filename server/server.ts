import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
app.use(
  cors({
    origin: true,
    credentials: false,
  }),
);
app.use(express.json({ limit: '2mb' }));

// API routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/establishments', establishmentRoutes);
app.use('/api/reviews', reviewRoutes);

app.listen(PORT, () => {
  console.log(`DishDetail API server running on http://localhost:${PORT}`);
});
