import { Router } from 'express';
import User from '../model/User.js';
import { publicUser } from '../utils/publicUser.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = 'secret';

router.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const existing = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim() }],
    }).lean();
    if (existing) {
      const field =
        existing.username === username.trim() ? 'username' : 'email';
      return res.status(409).json({ error: `That ${field} is already taken.` });
    }

    // SECURITY WARNING: Passwords stored in plaintext for development only.
    // In production, hash passwords with bcrypt before storage.
    const u = await User.create({
      email: email.trim(),
      username: username.trim(),
      password,
      bio: '',
    });

    return res.status(201).json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Signup failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe = false } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password.' });
    }

    const u = await User.findOne({ username: username.trim() });
    // Direct plaintext comparison; use bcrypt.compare() in production
    if (!u || u.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const expiresIn = rememberMe ? '30d' : '1d';
    const maxAge =
      rememberMe ?
        1000 * 60 * 60 * 24 * 30 // 30 days
      : 1000 * 60 * 60 * 24; // 1 day

    const token = jwt.sign({ id: u._id }, JWT_SECRET, {
      expiresIn,
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge,
    });

    return res.json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ user: null });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ user: null });

    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(401).json({ user: null });
  }
});

export default router;
