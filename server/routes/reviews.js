import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Review from '../model/Review.js';
import Establishment from '../model/Establishment.js';
import User from '../model/User.js';
import { syncEstablishmentRating } from '../utils/syncRating.js';
import { verifyToken } from '../utils/auth.js';
import { validate } from '../middleware/validate.js';
import {
  bodySchema,
  paramsSchema,
  querySchema,
} from '../validation/schemas.js';

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

router.get(
  '/',
  validate({ query: querySchema.reviewsList }),
  async (req, res) => {
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
          User.find({ $text: { $search: q } })
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
      if (cuisineFilter) {
        const estWithCuisine = await Establishment.find({
          cuisine: cuisineFilter,
        })
          .select('_id')
          .lean();
        const allowedIds = estWithCuisine.map((e) => e._id);
        if (filter.establishment) {
          if (
            !allowedIds.some(
              (id) => String(id) === String(filter.establishment),
            )
          ) {
            return res.json({ reviews: [], total: 0, page, limit });
          }
        } else {
          filter.establishment = { $in: allowedIds };
        }
      }

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('reviewer', 'username')
          .lean(),
        Review.countDocuments(filter),
      ]);
      const normalizedReviews = reviews.map(normalizeReview);

      return res.json({ reviews: normalizedReviews, total, page, limit });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to fetch reviews');
      return res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
  },
);

router.put(
  '/:id',
  verifyToken,
  validate({ params: paramsSchema.id, body: bodySchema.reviewUpdate }),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ error: 'Review not found.' });

      if (String(review.reviewer) !== String(req.user.id)) {
        return res
          .status(403)
          .json({ error: 'You can only edit your own reviews.' });
      }

      // Whitelist mutable review fields
      const allowed = [
        'title',
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
        if (k in req.body) updates[k] = req.body[k];
      }

      // Cleanup old Cloudinary image if it's being replaced or removed
      if (
        'reviewImage' in updates &&
        review.reviewImage &&
        review.reviewImage !== updates.reviewImage &&
        review.reviewImage.includes('cloudinary.com')
      ) {
        try {
          const parts = review.reviewImage.split('/');
          const folderPart = parts[parts.length - 2];
          const filenamePart = parts[parts.length - 1].split('.')[0];
          const publicId = `${folderPart}/${filenamePart}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          req.log?.error(
            { err: cloudinaryError },
            'Failed to delete old image from Cloudinary during review update',
          );
        }
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
      req.log?.error({ err: error }, 'Failed to update review');
      return res.status(400).json({ error: 'Failed to update review.' });
    }
  },
);

router.delete(
  '/:id',
  verifyToken,
  validate({ params: paramsSchema.id }),
  async (req, res) => {
    try {
      const r = await Review.findById(req.params.id);
      if (!r) return res.status(404).json({ error: 'Review not found.' });

      if (String(r.reviewer) !== String(req.user.id)) {
        return res
          .status(403)
          .json({ error: 'You can only delete your own reviews.' });
      }

      // If there is an image, delete it from Cloudinary
      if (r.reviewImage && r.reviewImage.includes('cloudinary.com')) {
        try {
          // Extract the public_id from the Cloudinary URL.
          // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
          const parts = r.reviewImage.split('/');
          const folderPart = parts[parts.length - 2];
          const filenamePart = parts[parts.length - 1].split('.')[0];
          const publicId = `${folderPart}/${filenamePart}`;

          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          // Log the error but don't block the review deletion
          req.log?.error(
            { err: cloudinaryError },
            'Failed to delete image from Cloudinary during review deletion',
          );
        }
      }

      await Review.findByIdAndDelete(req.params.id);
      await syncEstablishmentRating(r.establishment);

      return res.json({ ok: true });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to delete review');
      return res.status(400).json({ error: 'Failed to delete review.' });
    }
  },
);

router.post(
  '/:id/vote',
  verifyToken,
  validate({ params: paramsSchema.id, body: bodySchema.reviewVote }),
  async (req, res) => {
    try {
      const { type } = req.body;
      const voterId = req.user.id;

      const countField = type === 'helpful' ? 'helpfulCount' : 'unhelpfulCount';
      const voterField =
        type === 'helpful' ? 'helpfulVoters' : 'unhelpfulVoters';

      // Atomic update with duplicate prevention from HEAD
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
        const exists = await Review.exists({ _id: req.params.id });
        if (!exists)
          return res.status(404).json({ error: 'Review not found.' });
        return res
          .status(409)
          .json({ error: 'You have already voted on this review.' });
      }

      return res.json({
        helpfulCount: result.helpfulCount,
        unhelpfulCount: result.unhelpfulCount,
      });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to vote on review');
      return res.status(400).json({ error: 'Failed to vote.' });
    }
  },
);

export default router;
