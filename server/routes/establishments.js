import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Establishment from '../model/Establishment.js';
import Review from '../model/Review.js';
import User from '../model/User.js';
import { syncEstablishmentRating } from '../utils/syncRating.js';
import { verifyToken } from '../utils/auth.js';
import { generateSlug } from '../utils/slugify.js';
import { validate } from '../middleware/validate.js';
import {
  bodySchema,
  paramsSchema,
  querySchema,
} from '../validation/schemas.js';

const router = Router();

// Re-issues a signed JWT reflecting the user's current role.
// Called after create/claim so the client receives an updated token immediately
// rather than waiting for the next login.
function reissueToken(user) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT secret is not configured.');
  return jwt.sign(
    { id: user._id.toString(), username: user.username, role: user.role },
    jwtSecret,
    { expiresIn: '30d' },
  );
}

// ─── GET / ────────────────────────────────────────────────────────────────────

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
        // Text search covers indexed establishment fields.
        filter.$text = { $search: q };
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
      req.log?.error({ err: error }, 'Failed to fetch establishments');
      return res.status(500).json({ error: 'Failed to fetch establishments.' });
    }
  },
);

// ─── POST / ───────────────────────────────────────────────────────────────────
// Create a new establishment. Promotes the authenticated user to 'owner' and
// links them to the new listing. A user may only own one establishment.

router.post(
  '/',
  verifyToken,
  validate({ body: bodySchema.establishmentCreate }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ error: 'User not found.' });

      if (user.ownedEstablishment) {
        return res
          .status(409)
          .json({ error: 'You already own an establishment.' });
      }

      const {
        restaurantName,
        cuisine,
        description,
        address,
        hours,
        phone,
        website,
        restaurantImage,
      } = req.body;

      const slug = await generateSlug(restaurantName);

      const establishment = await Establishment.create({
        restaurantName,
        slug,
        cuisine,
        description: description || '',
        address: address || '',
        hours: hours || '',
        phone: phone || '',
        website: website || '',
        restaurantImage: restaurantImage || '',
        owner: user._id,
      });

      user.role = 'owner';
      user.ownedEstablishment = establishment._id;
      await user.save();

      const token = reissueToken(user);

      return res.status(201).json({ establishment, token });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to create establishment');
      return res.status(500).json({ error: 'Failed to create establishment.' });
    }
  },
);

// ─── GET /:slug ───────────────────────────────────────────────────────────────
// Populates the owner field so the client can identify whether the current
// user is the owner without an extra request.

router.get(
  '/:slug',
  validate({ params: paramsSchema.slug }),
  async (req, res) => {
    try {
      const est = await Establishment.findOne({ slug: req.params.slug })
        .populate('owner', 'username')
        .lean();
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
      req.log?.error({ err: error }, 'Failed to fetch establishment');
      return res.status(400).json({ error: 'Could not fetch establishment.' });
    }
  },
);

// ─── POST /:slug/claim ────────────────────────────────────────────────────────
// Claim ownership of an existing unclaimed establishment (e.g. from seed data).
// Fails if the establishment is already owned or the user already owns one.

router.post(
  '/:slug/claim',
  verifyToken,
  validate({ params: paramsSchema.slug }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ error: 'User not found.' });

      if (user.ownedEstablishment) {
        return res
          .status(409)
          .json({ error: 'You already own an establishment.' });
      }

      const establishment = await Establishment.findOne({
        slug: req.params.slug,
      });
      if (!establishment) return res.status(404).json({ error: 'Not found.' });

      if (establishment.owner) {
        return res
          .status(409)
          .json({ error: 'This establishment has already been claimed.' });
      }

      establishment.owner = user._id;
      await establishment.save();

      user.role = 'owner';
      user.ownedEstablishment = establishment._id;
      await user.save();

      const token = reissueToken(user);

      // Populate owner before returning so the shape matches GET /:slug
      await establishment.populate('owner', 'username');

      return res.json({ establishment, token });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to claim establishment');
      return res.status(500).json({ error: 'Failed to claim establishment.' });
    }
  },
);

// ─── PUT /:slug ───────────────────────────────────────────────────────────────
// Update an establishment's details. Only the owner of that specific listing
// may make changes.

router.put(
  '/:slug',
  verifyToken,
  validate({ params: paramsSchema.slug, body: bodySchema.establishmentUpdate }),
  async (req, res) => {
    try {
      const establishment = await Establishment.findOne({
        slug: req.params.slug,
      });
      if (!establishment) return res.status(404).json({ error: 'Not found.' });

      if (establishment.owner?.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'You do not own this establishment.' });
      }

      const {
        restaurantName,
        cuisine,
        description,
        address,
        hours,
        phone,
        website,
        restaurantImage,
      } = req.body;

      // Regenerate slug if the name has changed
      if (restaurantName && restaurantName !== establishment.restaurantName) {
        establishment.slug = await generateSlug(restaurantName);
        establishment.restaurantName = restaurantName;
      }
      if (cuisine !== undefined) establishment.cuisine = cuisine;
      if (description !== undefined) establishment.description = description;
      if (address !== undefined) establishment.address = address;
      if (hours !== undefined) establishment.hours = hours;
      if (phone !== undefined) establishment.phone = phone;
      if (website !== undefined) establishment.website = website;
      if (restaurantImage !== undefined)
        establishment.restaurantImage = restaurantImage;

      await establishment.save();
      await establishment.populate('owner', 'username');

      return res.json({ establishment });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to update establishment');
      return res.status(500).json({ error: 'Failed to update establishment.' });
    }
  },
);

// ─── POST /:slug/reviews ──────────────────────────────────────────────────────
// Create a review under an establishment.

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
      req.log?.error({ err: error }, 'Failed to create review');
      return res.status(400).json({ error: 'Failed to create review.' });
    }
  },
);

export default router;
