import { Router } from 'express';
import User from '../model/User.js';

const router = Router();

function publicUser(u) {
  return {
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    bio: u.bio,
    role: u.role,
    ownedEstablishment: u.ownedEstablishment || null,
  };
}

router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(u) });
  } catch {
    return res.status(400).json({ error: 'Invalid user id.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body?.avatar === 'string') updates.avatar = req.body.avatar;
    if (typeof req.body?.bio === 'string') updates.bio = req.body.bio;

    const u = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!u) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: publicUser(u) });
  } catch {
    return res.status(400).json({ error: 'Invalid request.' });
  }
});

export default router;
