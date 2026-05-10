import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Review from '../model/Review.js';
import Establishment from '../model/Establishment.js';
import User from '../model/User.js';
import { syncEstablishmentRating } from '../utils/syncRating.js';
import { optionalToken, verifyToken } from '../utils/auth.js';
import { validate } from '../middleware/validate.js';
import {
  bodySchema,
  paramsSchema,
  querySchema,
} from '../validation/schemas.js';

const router = Router();

function normalizeComment(comment) {
  const author =
    comment.authorId && typeof comment.authorId === 'object' ?
      comment.authorId
    : null;

  return {
    ...comment,
    author: author?.username || comment.author || 'Unknown',
    authorId: author?._id || comment.authorId || null,
  };
}

function getUserVote(review, viewerId) {
  if (!viewerId) return null;
  if (review.helpfulVoters?.some((id) => String(id) === String(viewerId))) {
    return 'helpful';
  }
  if (review.unhelpfulVoters?.some((id) => String(id) === String(viewerId))) {
    return 'unhelpful';
  }
  return null;
}

function normalizeReview(review, viewerId) {
  const establishment =
    review.establishment && typeof review.establishment === 'object' ?
      review.establishment
    : null;
  const { helpfulVoters, unhelpfulVoters, ...safeReview } = review;

  return {
    ...safeReview,
    establishment: establishment?._id || review.establishment,
    establishmentSummary:
      establishment ?
        {
          _id: establishment._id,
          restaurantName: establishment.restaurantName,
          slug: establishment.slug,
          cuisine: establishment.cuisine,
          rating: establishment.rating,
          restaurantImage: establishment.restaurantImage,
          address: establishment.address,
          description: establishment.description,
        }
      : undefined,
    reviewer: review.reviewer?.username || 'Unknown',
    reviewerId:
      typeof review.reviewer === 'object' ?
        review.reviewer?._id
      : review.reviewer,
    comments: (review.comments || []).map(normalizeComment),
    userVote: getUserVote({ helpfulVoters, unhelpfulVoters }, viewerId),
  };
}

async function sendPopulatedReview(res, review, viewerId) {
  const populated = await review.populate([
    { path: 'reviewer', select: 'username' },
    { path: 'comments.authorId', select: 'username' },
    {
      path: 'establishment',
      select:
        'restaurantName slug cuisine rating restaurantImage address description',
    },
  ]);
  return res.json({ review: normalizeReview(populated.toObject(), viewerId) });
}

async function isEstablishmentOwner(review, userId) {
  const establishment = await Establishment.findById(review.establishment)
    .select('owner')
    .lean();
  return Boolean(
    establishment?.owner && String(establishment.owner) === String(userId),
  );
}

router.get(
  '/',
  optionalToken,
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

      const reviewsQuery = Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('reviewer', 'username')
        .populate('comments.authorId', 'username')
        .populate(
          'establishment',
          'restaurantName slug cuisine rating restaurantImage address description',
        );

      if (req.user?.id) {
        reviewsQuery.select('+helpfulVoters +unhelpfulVoters');
      }

      const [reviews, total] = await Promise.all([
        reviewsQuery.lean(),
        Review.countDocuments(filter),
      ]);
      const normalizedReviews = reviews.map((review) =>
        normalizeReview(review, req.user?.id),
      );

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
      const review = await Review.findById(req.params.id).select(
        '+helpfulVoters +unhelpfulVoters',
      );
      if (!review) return res.status(404).json({ error: 'Review not found.' });

      if (String(review.reviewer) !== String(req.user.id)) {
        return res
          .status(403)
          .json({ error: 'You can only edit your own reviews.' });
      }

      // Whitelist only user-editable review content. Counters, comments,
      // owner responses, and edit metadata are server-owned fields.
      const allowed = ['title', 'body', 'rating', 'reviewImage'];
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

      if (Object.keys(updates).length > 0) {
        updates.isEdited = true;
      }

      Object.assign(review, updates);
      await review.save();

      // Only recalculate establishment rating if the review's rating changed
      if (updates.rating !== undefined) {
        await syncEstablishmentRating(review.establishment);
      }

      return sendPopulatedReview(res, review, req.user.id);
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to update review');
      return res.status(400).json({ error: 'Failed to update review.' });
    }
  },
);

router.post(
  '/:id/comments',
  verifyToken,
  validate({ params: paramsSchema.id, body: bodySchema.commentCreate }),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id).select(
        '+helpfulVoters +unhelpfulVoters',
      );
      if (!review) return res.status(404).json({ error: 'Review not found.' });

      review.comments.push({
        authorId: req.user.id,
        author: req.user.username,
        date: new Date().toISOString(),
        body: req.body.body,
        isEdited: false,
      });
      await review.save();

      return sendPopulatedReview(res, review, req.user.id);
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to add review comment');
      return res.status(400).json({ error: 'Failed to add comment.' });
    }
  },
);

router.put(
  '/:id/comments/:commentId',
  verifyToken,
  validate({ params: paramsSchema.idComment, body: bodySchema.commentUpdate }),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id).select(
        '+helpfulVoters +unhelpfulVoters',
      );
      if (!review) return res.status(404).json({ error: 'Review not found.' });

      const comment = review.comments.id(req.params.commentId);
      if (!comment)
        return res.status(404).json({ error: 'Comment not found.' });

      const isAuthor =
        comment.authorId ?
          String(comment.authorId) === String(req.user.id)
        : comment.author === req.user.username;

      if (!isAuthor) {
        return res
          .status(403)
          .json({ error: 'You can only edit your own comments.' });
      }

      comment.body = req.body.body;
      comment.isEdited = true;
      await review.save();

      return sendPopulatedReview(res, review, req.user.id);
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to update review comment');
      return res.status(400).json({ error: 'Failed to update comment.' });
    }
  },
);

router.delete(
  '/:id/comments/:commentId',
  verifyToken,
  validate({ params: paramsSchema.idComment }),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id).select(
        '+helpfulVoters +unhelpfulVoters',
      );
      if (!review) return res.status(404).json({ error: 'Review not found.' });

      const comment = review.comments.id(req.params.commentId);
      if (!comment)
        return res.status(404).json({ error: 'Comment not found.' });

      const isAuthor =
        comment.authorId ?
          String(comment.authorId) === String(req.user.id)
        : comment.author === req.user.username;

      if (!isAuthor) {
        return res
          .status(403)
          .json({ error: 'You can only delete your own comments.' });
      }

      comment.deleteOne();
      await review.save();

      return sendPopulatedReview(res, review, req.user.id);
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to delete review comment');
      return res.status(400).json({ error: 'Failed to delete comment.' });
    }
  },
);

router.put(
  '/:id/owner-response',
  verifyToken,
  validate({ params: paramsSchema.id, body: bodySchema.ownerResponse }),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id).select(
        '+helpfulVoters +unhelpfulVoters',
      );
      if (!review) return res.status(404).json({ error: 'Review not found.' });

      if (!(await isEstablishmentOwner(review, req.user.id))) {
        return res
          .status(403)
          .json({ error: 'Only the establishment owner can respond.' });
      }

      review.ownerResponse = {
        date: new Date().toISOString(),
        body: req.body.body,
      };
      await review.save();

      return sendPopulatedReview(res, review, req.user.id);
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to save owner response');
      return res.status(400).json({ error: 'Failed to save response.' });
    }
  },
);

router.delete(
  '/:id/owner-response',
  verifyToken,
  validate({ params: paramsSchema.id }),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id).select(
        '+helpfulVoters +unhelpfulVoters',
      );
      if (!review) return res.status(404).json({ error: 'Review not found.' });

      if (!(await isEstablishmentOwner(review, req.user.id))) {
        return res
          .status(403)
          .json({ error: 'Only the establishment owner can delete response.' });
      }

      review.ownerResponse = null;
      await review.save();

      return sendPopulatedReview(res, review, req.user.id);
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to delete owner response');
      return res.status(400).json({ error: 'Failed to delete response.' });
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
        userVote: type,
      });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to vote on review');
      return res.status(400).json({ error: 'Failed to vote.' });
    }
  },
);

export default router;
