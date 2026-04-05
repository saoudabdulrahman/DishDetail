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
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const cuisineFilter = (req.query.cuisine || '').toString().trim();

    const filter = {};
    if (req.query.establishmentId) {
      filter.establishment = req.query.establishmentId;
    }

    if (q) {
      // $text cannot appear inside $or in MongoDB — it must be a top-level
      // filter or its results pre-fetched. We collect matching IDs from all
      // three sources and then union them with a single $in at the top level.
      const [textMatches, estMatches, reviewerMatches] = await Promise.all([
        Review.find({ $text: { $search: q } })
          .select('_id')
          .lean(),
        Establishment.find({ $text: { $search: q } })
          .select('_id')
          .lean(),
        User.find({ username: { $regex: q, $options: 'i' } })
          .select('_id')
          .lean(),
      ]);
      filter.$or = [
        { _id: { $in: textMatches.map((r) => r._id) } },
        { reviewer: { $in: reviewerMatches.map((u) => u._id) } },
        { establishment: { $in: estMatches.map((e) => e._id) } },
      ];
    }

    // If a cuisine filter is active, restrict to establishments that serve it.
    // We do this as a pre-query so the result IDs can fold into the main filter,
    // keeping pagination counts accurate server-side.
    if (cuisineFilter) {
      const estWithCuisine = await Establishment.find({
        cuisine: cuisineFilter,
      })
        .select('_id')
        .lean();
      const allowedIds = estWithCuisine.map((e) => e._id);
      // Merge with any existing establishment constraint
      if (filter.establishment) {
        // Already filtering by a specific establishment — intersect
        if (
          !allowedIds.some((id) => String(id) === String(filter.establishment))
        ) {
          // The specific establishment doesn't serve this cuisine, return empty
          return res.json({ reviews: [], total: 0, page, limit });
        }
      } else {
        filter.establishment = { $in: allowedIds };
      }
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('reviewer', 'username')
        .lean(),
      Review.countDocuments(filter),
    ]);
    const normalizedReviews = reviews.map(normalizeReview);

    return res.json({ reviews: normalizedReviews, total, page, limit });
  } catch (error) {
    req.log.error({ err: error });
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
    req.log.error({ err: error });
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
    req.log.error({ err: error });
    return res.status(400).json({ error: 'Failed to delete review.' });
  }
});

router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { type } = req.body || {};
    const voterId = req.user.id;
    if (type !== 'helpful' && type !== 'unhelpful') {
      return res.status(400).json({ error: 'Invalid vote type.' });
    }

    const countField = type === 'helpful' ? 'helpfulCount' : 'unhelpfulCount';
    const voterField = type === 'helpful' ? 'helpfulVoters' : 'unhelpfulVoters';

    // Atomically match only if the review exists and the user has not voted
    // on either side yet. The $ne checks on both arrays prevent cross-type
    // double voting and make the check-and-update a single round-trip.
    const result = await Review.findOneAndUpdate(
      {
        _id: req.params.id,
        helpfulVoters: { $ne: voterId },
        unhelpfulVoters: { $ne: voterId },
      },
      {
        $inc: { [countField]: 1 },
        $addToSet: { [voterField]: voterId },
      },
      { new: true },
    );

    if (!result) {
      // Distinguish between review-not-found and already-voted.
      const exists = await Review.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ error: 'Review not found.' });
      return res
        .status(409)
        .json({ error: 'You have already voted on this review.' });
    }

    return res.json({
      helpfulCount: result.helpfulCount,
      unhelpfulCount: result.unhelpfulCount,
    });
  } catch (error) {
    req.log.error({ err: error });
    return res.status(400).json({ error: 'Failed to vote.' });
  }
});

export default router;
