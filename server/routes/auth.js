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

router.post('/signup', async (req, res) => {
	try {
		const { email, username, password } = req.body || {};
		if (!email || !username || !password) {
			return res.status(400).json({ error: 'Missing required fields.' });
		}

		const existing = await User.findOne({
			$or: [{ username: username.trim() }, { email: email.trim() }]
		}).lean();
		if (existing) {
			const field = existing.username === username.trim() ? 'username' : 'email';
			return res.status(409).json({ error: `That ${field} is already taken.` });
		}

		// This is a simplified auth implementation for development only.
		const u = await User.create({
			email: email.trim(),
			username: username.trim(),
			password,
			avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
			bio: '',
		});

		return res.status(201).json({ user: publicUser(u) });
	} catch {
		return res.status(500).json({ error: 'Signup failed.' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body || {};
		if (!username || !password) {
			return res.status(400).json({ error: 'Missing username or password.' });
		}
		const u = await User.findOne({ username: username.trim() });
		if (!u || u.password !== password) {
			return res.status(401).json({ error: 'Invalid username or password.' });
		}
		return res.json({ user: publicUser(u) });
	} catch {
		return res.status(500).json({ error: 'Login failed.' });
	}
});

export default router;
