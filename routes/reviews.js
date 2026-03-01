import { Router } from 'express';
import Review from '../model/Review.js';
import Establishment from '../model/Establishment.js';

const router = Router();

router.get('/', async (req, res) => {
	const q = (req.query.q || '').toString().trim();

	const filter = {};
	if (req.query.establishmentId) {
		filter.establishment = req.query.establishmentId;
	}

	let reviews = await Review.find(filter).lean();

	// Simple text search across review body & reviewer & establishment name
	if (q) {
		const estMatches = await Establishment.find({
			restaurantName: { $regex: q, $options: 'i' },
		})
			.select('_id')
			.lean();
		const estIds = new Set(estMatches.map((e) => e._id.toString()));

		reviews = reviews.filter((r) => {
			const bodyMatch = (r.body || '').toLowerCase().includes(q.toLowerCase());
			const reviewerMatch = (r.reviewer || '')
				.toLowerCase()
				.includes(q.toLowerCase());
			const estMatch = estIds.has(r.establishment.toString());
			return bodyMatch || reviewerMatch || estMatch;
		});
	}

	return res.json({ reviews });
});

router.put('/:id', async (req, res) => {
	try {
		const allowed = [
			'body',
			'rating',
			'isEdited',
			'helpfulCount',
			'unhelpfulCount',
			'comments',
			'ownerResponse',
			'reviewImage',
		];
		const updates = {};
		for (const k of allowed) {
			if (k in (req.body || {})) updates[k] = req.body[k];
		}

		const review = await Review.findByIdAndUpdate(req.params.id, updates, {
			new: true,
		});
		if (!review) return res.status(404).json({ error: 'Review not found.' });
		return res.json({ review });
	} catch {
		return res.status(400).json({ error: 'Failed to update review.' });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const r = await Review.findByIdAndDelete(req.params.id);
		if (!r) return res.status(404).json({ error: 'Review not found.' });
		return res.json({ ok: true });
	} catch {
		return res.status(400).json({ error: 'Failed to delete review.' });
	}
});

router.post('/:id/vote', async (req, res) => {
	try {
		const { type } = req.body || {};
		if (type !== 'helpful' && type !== 'unhelpful') {
			return res.status(400).json({ error: 'Invalid vote type.' });
		}
		const review = await Review.findById(req.params.id);
		if (!review) return res.status(404).json({ error: 'Review not found.' });
		if (type === 'helpful') review.helpfulCount += 1;
		if (type === 'unhelpful') review.unhelpfulCount += 1;
		await review.save();
		return res.json({
			helpfulCount: review.helpfulCount,
			unhelpfulCount: review.unhelpfulCount,
		});
	} catch {
		return res.status(400).json({ error: 'Failed to vote.' });
	}
});

export default router;
