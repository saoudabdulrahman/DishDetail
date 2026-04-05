import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncEstablishmentRating } from '../utils/syncRating.js';
import Review from '../model/Review.js';
import Establishment from '../model/Establishment.js';

// Mock the Mongoose models
vi.mock('../model/Review.js', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('../model/Establishment.js', () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
  },
}));

describe('syncEstablishmentRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly calculate the average rating to 1 decimal point', async () => {
    Review.find.mockResolvedValue([
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
    ]); // Avg: 14 / 3 = 4.666... -> 4.7

    await syncEstablishmentRating('est_123');

    expect(Review.find).toHaveBeenCalledWith({ establishment: 'est_123' });
    expect(Establishment.findByIdAndUpdate).toHaveBeenCalledWith('est_123', {
      rating: 4.7,
    });
  });

  it('should correctly calculate an exact whole number average', async () => {
    Review.find.mockResolvedValue([{ rating: 4 }, { rating: 4 }]);

    await syncEstablishmentRating('est_123');

    expect(Establishment.findByIdAndUpdate).toHaveBeenCalledWith('est_123', {
      rating: 4,
    });
  });

  it('should set rating to 0 if there are no reviews', async () => {
    Review.find.mockResolvedValue([]);

    await syncEstablishmentRating('est_empty');

    expect(Establishment.findByIdAndUpdate).toHaveBeenCalledWith('est_empty', {
      rating: 0,
    });
  });
});
