import { Router } from 'express';
import Establishment from '../model/Establishment.js';
import Review from '../model/Review.js';
import { syncEstablishmentRating } from '../utils/syncRating.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const minRating = Number(req.query.minRating || 0);

    const filter = {};
    if (q) {
      filter.$or = [
        { restaurantName: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (!Number.isNaN(minRating) && minRating > 0) {
      filter.rating = { $gte: minRating };
    }

    const establishments = await Establishment.find(filter)
      .sort({ rating: -1, restaurantName: 1 })
      .lean();

    return res.json({ establishments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch establishments.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const est = await Establishment.findOne({ slug: req.params.slug }).lean();
    if (!est) return res.status(404).json({ error: 'Not found.' });

    const reviews = await Review.find({ establishment: est._id }).lean();
    return res.json({ establishment: est, reviews });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'Could not fetch establishment.' });
  }
});

// Create a review under an establishment
router.post('/:slug/reviews', async (req, res) => {
  try {
    const est = await Establishment.findOne({ slug: req.params.slug });
    if (!est) return res.status(404).json({ error: 'Not found.' });

    const { title, rating, reviewer, reviewerAvatar, body, reviewImage } =
      req.body || {};
    if (!title || !rating || !reviewer || !body) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const review = await Review.create({
      establishment: est._id,
      title,
      rating: Number(rating),
      reviewer,
      reviewerAvatar:
        reviewerAvatar ||
        `https://i.pravatar.cc/150?u=${encodeURIComponent(reviewer)}`,
      body,
      reviewImage: reviewImage || null,
    });

    await syncEstablishmentRating(est._id);

    return res.status(201).json({ review });
  } catch {
    return res.status(400).json({ error: 'Failed to create review.' });
  }
});

export default router;
