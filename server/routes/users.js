import { Router } from 'express';
import User from '../model/User.js';
import Review from '../model/Review.js';
import { publicUser } from '../utils/publicUser.js';

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
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Invalid user id.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Whitelist mutable fields; prevent updates to email, username, password, role
    const updates = {};
    if (typeof req.body?.avatar === 'string') updates.avatar = req.body.avatar;
    if (typeof req.body?.bio === 'string') updates.bio = req.body.bio;

    const u = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!u) return res.status(404).json({ error: 'User not found.' });

    // Sync avatar updates to the user's past reviews
    if (updates.avatar !== undefined) {
      await Review.updateMany(
        { reviewer: u.username },
        { reviewerAvatar: u.avatar },
      );
    }

    return res.json({ user: publicUser(u) });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Invalid request.' });
  }
});

export default router;
