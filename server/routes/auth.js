import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../model/User.js';
import { publicUser } from '../utils/publicUser.js';

const router = Router();
const SALT_ROUNDS = 10;

router.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body || {};

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters long.' });
    }

    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    }).lean();

    if (existing) {
      const field = existing.username === cleanUsername ? 'username' : 'email';
      return res.status(409).json({ error: `That ${field} is already taken.` });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const u = await User.create({
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(cleanUsername)}`,
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
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password.' });
    }

    const cleanUsername = username.trim();
    const u = await User.findOne({ username: cleanUsername });

    if (!u) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, u.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    return res.json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

export default router;
