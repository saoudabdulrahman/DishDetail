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

	if (q) {
		const estMatches = await Establishment.find({
			restaurantName: { $regex: q, $options: 'i' },
		}).select('_id');
		filter.$or = [
			{ body: { $regex: q, $options: 'i' } },
			{ reviewer: { $regex: q, $options: 'i' } },
			{ establishment: { $in: estMatches.map((e) => e._id) } },
		];
	}

	const reviews = await Review.find(filter).lean();

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

		if (updates.rating !== undefined) {
			const est = await Establishment.findById(review.establishment);
			if (est) {
				// Re-syncing the establishment rating after an update.
				// NOTE: This logic is duplicated across create, update, and delete routes.
				// In a larger app, we'd probably move this to a Mongoose middleware or a shared service.
				const reviews = await Review.find({ establishment: est._id });
				const avgRating =
					reviews.length > 0 ?
						reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
					:	0;
				est.rating = avgRating;
				await est.save();
			}
		}

		return res.json({ review });
	} catch {
		return res.status(400).json({ error: 'Failed to update review.' });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const r = await Review.findByIdAndDelete(req.params.id);
		if (!r) return res.status(404).json({ error: 'Review not found.' });

		const est = await Establishment.findById(r.establishment);
		if (est) {
			const reviews = await Review.find({ establishment: est._id });
			const avgRating =
				reviews.length > 0 ?
					reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length
				:	0;
			est.rating = avgRating;
			await est.save();
		}

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
