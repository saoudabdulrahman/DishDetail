import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDb } from './model/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import establishmentRoutes from './routes/establishments.js';
import reviewRoutes from './routes/reviews.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

await connectDb(process.env.MONGODB_URI);

// Middleware
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

// Serve the built React app (Vite build output)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

app.use(express.static(distDir));

// SPA fallback (let React Router handle client-side routes)
app.get('*', (req, res) => {
	res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
	console.log(`DishDetail server running on http://localhost:${PORT}`);
});
