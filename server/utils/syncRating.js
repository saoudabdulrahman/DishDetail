import Review from '../model/Review.js';
import Establishment from '../model/Establishment.js';

/**
 * Recalculates and persists the average rating for an establishment
 * based on all of its current reviews.
 *
 * Call this after any review create, update (if rating changed), or delete.
 */
export async function syncEstablishmentRating(establishmentId) {
  const reviews = await Review.find({ establishment: establishmentId });
  const avg =
    reviews.length > 0 ?
      Number(
        (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1),
      )
    : 0;
  await Establishment.findByIdAndUpdate(establishmentId, { rating: avg });
}
