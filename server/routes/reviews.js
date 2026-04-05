import { Router } from 'express';
import Review from '../model/Review.js';
import Establishment from '../model/Establishment.js';
import User from '../model/User.js';
import { syncEstablishmentRating } from '../utils/syncRating.js';
import { verifyToken } from '../utils/auth.js';

const router = Router();

function normalizeReview(review) {
  return {
    ...review,
    reviewer: review.reviewer?.username || 'Unknown',
    reviewerId:
      typeof review.reviewer === 'object' ?
        review.reviewer?._id
      : review.reviewer,
  };
}

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();

    const filter = {};
    if (req.query.establishmentId) {
      filter.establishment = req.query.establishmentId;
    }

    if (q) {
      // Two-step search: find establishments by name, then reviews matching text or those establishments
      const estMatches = await Establishment.find({
        restaurantName: { $regex: q, $options: 'i' },
      }).select('_id');
      const reviewerMatches = await User.find({
        username: { $regex: q, $options: 'i' },
      }).select('_id');
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } },
        { reviewer: { $in: reviewerMatches.map((u) => u._id) } },
        { establishment: { $in: estMatches.map((e) => e._id) } },
      ];
    }

    const reviews = await Review.find(filter)
      .populate('reviewer', 'username')
      .lean();
    const normalizedReviews = reviews.map(normalizeReview);

    return res.json({ reviews: normalizedReviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Whitelist mutable review fields; exclude establishment, reviewer, date.
    // helpfulCount and unhelpfulCount are intentionally excluded — they are only
    // mutated through POST /:id/vote to prevent self-manipulation.
    const allowed = [
      'title',
      'body',
      'rating',
      'isEdited',
      'comments',
      'ownerResponse',
      'reviewImage',
    ];
    const updates = {};
    for (const k of allowed) {
      if (k in (req.body || {})) updates[k] = req.body[k];
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (String(review.reviewer) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ error: 'You can only edit your own reviews.' });
    }

    Object.assign(review, updates);
    await review.save();

    // Only recalculate establishment rating if the review's rating changed
    if (updates.rating !== undefined) {
      await syncEstablishmentRating(review.establishment);
    }

    const populated = await review.populate('reviewer', 'username');
    return res.json({ review: normalizeReview(populated.toObject()) });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to update review.' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const r = await Review.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Review not found.' });
    if (String(r.reviewer) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ error: 'You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(req.params.id);

    await syncEstablishmentRating(r.establishment);

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to delete review.' });
  }
});

router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { type } = req.body || {};
    if (type !== 'helpful' && type !== 'unhelpful') {
      return res.status(400).json({ error: 'Invalid vote type.' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    // No duplicate-vote prevention; same user can vote multiple times
    if (type === 'helpful') review.helpfulCount += 1;
    if (type === 'unhelpful') review.unhelpfulCount += 1;
    await review.save();
    return res.json({
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to vote.' });
  }
});

export default router;
