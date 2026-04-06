import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../model/User.js';
import { publicUser } from '../utils/publicUser.js';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/auth.js';
import { validate } from '../middleware/validate.js';
import { bodySchema } from '../validation/schemas.js';

const router = Router();
const SALT_ROUNDS = 10;

function signTokenForUser(user) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret is not configured.');
  }

  return jwt.sign(
    { id: user._id.toString(), username: user.username },
    jwtSecret,
    {
      expiresIn: '30d',
    },
  );
}

router.post(
  '/signup',
  validate({ body: bodySchema.signup }),
  async (req, res) => {
    try {
      const { email, username, password } = req.body;

      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim();

      const existing = await User.findOne({
        $or: [{ username: cleanUsername }, { email: cleanEmail }],
      }).lean();

      if (existing) {
        const field =
          existing.username === cleanUsername ? 'username' : 'email';
        return res
          .status(409)
          .json({ error: `That ${field} is already taken.` });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const u = await User.create({
        email: cleanEmail,
        username: cleanUsername,
        password: hashedPassword,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(cleanUsername)}`,
        bio: '',
      });

      const token = signTokenForUser(u);
      return res.status(201).json({ user: publicUser(u, true), token });
    } catch (error) {
      req.log?.error({ err: error }) || console.error(error);
      return res.status(500).json({ error: 'Signup failed.' });
    }
  },
);

router.post(
  '/login',
  validate({ body: bodySchema.login }),
  async (req, res) => {
    try {
      const { username, password } = req.body;

      const u = await User.findOne({ username: username.trim() });

      if (!u) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const isMatch = await bcrypt.compare(password, u.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const token = signTokenForUser(u);
      return res.json({ user: publicUser(u, true), token });
    } catch (error) {
      req.log?.error({ err: error }) || console.error(error);
      return res.status(500).json({ error: 'Login failed.' });
    }
  },
);

router.post('/logout', (req, res) => {
  // JWT is stateless; there is nothing to invalidate server-side.
  // Logout is handled client-side by clearing the token from storage.
  res.json({ message: 'Logged out' });
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ user: null });

    return res.json({ user: publicUser(user, true) });
  } catch {
    return res.status(401).json({ user: null });
  }
});

export default router;
