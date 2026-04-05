import { Router } from 'express';
import Establishment from '../model/Establishment.js';
import Review from '../model/Review.js';
import { syncEstablishmentRating } from '../utils/syncRating.js';
import { verifyToken } from '../utils/auth.js';
import { validate } from '../middleware/validate.js';
import {
  bodySchema,
  paramsSchema,
  querySchema,
} from '../validation/schemas.js';

const router = Router();

router.get(
  '/',
  validate({ query: querySchema.establishmentsList }),
  async (req, res) => {
    try {
      const q = (req.query.q || '').toString().trim();
      const minRating = Number(req.query.minRating || 0);
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 20);
      const cuisineFilter = (req.query.cuisine || '').toString().trim();

      const filter = {};
      if (q) {
        // $text index replaces the regex search for restaurantName and description.
        // We also keep a regex match for cuisine array since it's not in the text index.
        filter.$or = [
          { $text: { $search: q } },
          { cuisine: { $elemMatch: { $regex: q, $options: 'i' } } },
        ];
      }
      // Cuisine filter is applied server-side so pagination counts are accurate.
      if (cuisineFilter) {
        filter.cuisine = cuisineFilter;
      }
      // Apply rating filter only if minRating is valid and positive
      if (!Number.isNaN(minRating) && minRating > 0) {
        filter.rating = { $gte: minRating };
      }

      // Sort by highest rating first, then alphabetical for ties
      const [establishments, total] = await Promise.all([
        Establishment.find(filter)
          .sort({ rating: -1, restaurantName: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Establishment.countDocuments(filter),
      ]);

      return res.json({ establishments, total, page, limit });
    } catch (error) {
      req.log?.error({ err: error }) || console.error(error);
      return res.status(500).json({ error: 'Failed to fetch establishments.' });
    }
  },
);

router.get(
  '/:slug',
  validate({ params: paramsSchema.slug }),
  async (req, res) => {
    try {
      const est = await Establishment.findOne({ slug: req.params.slug }).lean();
      if (!est) return res.status(404).json({ error: 'Not found.' });

      const reviews = await Review.find({ establishment: est._id })
        .populate('reviewer', 'username')
        .lean();
      const normalizedReviews = reviews.map((review) => ({
        ...review,
        reviewer: review.reviewer?.username || 'Unknown',
        reviewerId:
          typeof review.reviewer === 'object' ?
            review.reviewer?._id
          : review.reviewer,
      }));
      return res.json({ establishment: est, reviews: normalizedReviews });
    } catch (error) {
      req.log?.error({ err: error }) || console.error(error);
      return res.status(400).json({ error: 'Could not fetch establishment.' });
    }
  },
);

// Create a review under an establishment
router.post(
  '/:slug/reviews',
  verifyToken,
  validate({ params: paramsSchema.slug, body: bodySchema.reviewCreate }),
  async (req, res) => {
    try {
      const est = await Establishment.findOne({ slug: req.params.slug });
      if (!est) return res.status(404).json({ error: 'Not found.' });

      const { title, rating, body, reviewImage } = req.body;

      const review = await Review.create({
        establishment: est._id,
        title,
        rating: Number(rating),
        reviewer: req.user.id,
        body,
        reviewImage: reviewImage || null,
      });

      // Recalculate establishment's average rating to include new review
      await syncEstablishmentRating(est._id);

      return res.status(201).json({ review });
    } catch (error) {
      req.log?.error({ err: error }) || console.error(error);
      return res.status(400).json({ error: 'Failed to create review.' });
    }
  },
);

export default router;
