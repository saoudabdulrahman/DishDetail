import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../model/User.js';
import { publicUser } from '../utils/publicUser.js';
import { verifyToken } from '../utils/auth.js';

const router = Router();

router.get('/username/:username', async (req, res) => {
  try {
    const u = await User.findOne({ username: req.params.username });
    if (!u) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Invalid user id.' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }

    if (String(req.user.id) !== String(req.params.id)) {
      return res
        .status(403)
        .json({ error: 'You can only update your own profile.' });
    }

    // Whitelist mutable fields; prevent updates to email, username, password, role
    const updates = {};
    if (typeof req.body?.bio === 'string') updates.bio = req.body.bio;

    const u = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!u) return res.status(404).json({ error: 'User not found.' });

    return res.json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Invalid request.' });
  }
});

export default router;
