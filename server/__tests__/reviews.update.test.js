import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const { findById, estFindById, syncEstablishmentRating } = vi.hoisted(() => ({
  findById: vi.fn(),
  estFindById: vi.fn(),
  syncEstablishmentRating: vi.fn(),
}));

vi.mock('../model/Review.js', () => ({
  default: { findById },
}));

vi.mock('../model/Establishment.js', () => ({
  default: { findById: estFindById },
}));

vi.mock('../model/User.js', () => ({
  default: {},
}));

vi.mock('../utils/syncRating.js', () => ({
  syncEstablishmentRating,
}));

vi.mock('../utils/auth.js', () => ({
  optionalToken: (_req, _res, next) => next(),
  verifyToken: (req, _res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011', username: 'alice' };
    return next();
  },
}));

vi.mock('cloudinary', () => ({
  v2: { uploader: { destroy: vi.fn() } },
}));

import reviewsRouter from '../routes/reviews.js';

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewsRouter);

function makeReview(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439001',
    title: 'Old title',
    body: 'Old body',
    rating: 3,
    reviewer: '507f1f77bcf86cd799439011',
    establishment: '507f1f77bcf86cd799439012',
    reviewImage: null,
    isEdited: false,
    save: vi.fn().mockResolvedValue(undefined),
    populate: vi.fn().mockResolvedValue({
      toObject: () => ({
        _id: '507f1f77bcf86cd799439001',
        title: 'New title',
        body: 'Old body',
        rating: 3,
        reviewer: {
          _id: '507f1f77bcf86cd799439011',
          username: 'alice',
        },
        establishment: '507f1f77bcf86cd799439012',
        isEdited: true,
      }),
    }),
    ...overrides,
  };
}

function mockFindById(review) {
  findById.mockReturnValue({
    select: vi.fn().mockResolvedValue(review),
  });
}

describe('Review update route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects server-owned fields in generic review updates', async () => {
    const res = await request(app)
      .put('/api/reviews/507f1f77bcf86cd799439001')
      .send({
        helpfulCount: 99,
        unhelpfulCount: 1,
        comments: [],
        ownerResponse: null,
        isEdited: false,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Review updates may only include title, body, rating, or reviewImage.',
    );
    expect(findById).not.toHaveBeenCalled();
  });

  it('sets isEdited server-side when editable content changes', async () => {
    const review = makeReview();
    mockFindById(review);

    const res = await request(app)
      .put('/api/reviews/507f1f77bcf86cd799439001')
      .send({ title: 'New title' });

    expect(res.status).toBe(200);
    expect(review.title).toBe('New title');
    expect(review.isEdited).toBe(true);
    expect(review.save).toHaveBeenCalled();
  });

  it('syncs establishment rating when rating changes', async () => {
    const review = makeReview();
    mockFindById(review);

    const res = await request(app)
      .put('/api/reviews/507f1f77bcf86cd799439001')
      .send({ rating: 4 });

    expect(res.status).toBe(200);
    expect(syncEstablishmentRating).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439012',
    );
  });

  it('blocks non-owners from writing owner responses', async () => {
    mockFindById(makeReview());
    estFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          owner: '507f1f77bcf86cd799439099',
        }),
      }),
    });

    const res = await request(app)
      .put('/api/reviews/507f1f77bcf86cd799439001/owner-response')
      .send({ body: 'Thanks for visiting.' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only the establishment owner can respond.');
  });

  it('uses comment authorId instead of username for comment authorization', async () => {
    const comment = {
      _id: '507f1f77bcf86cd799439022',
      authorId: '507f1f77bcf86cd799439099',
      author: 'alice',
      body: 'Original',
      isEdited: false,
    };
    const review = makeReview({
      comments: {
        id: vi.fn().mockReturnValue(comment),
      },
    });
    mockFindById(review);

    const res = await request(app)
      .put(
        '/api/reviews/507f1f77bcf86cd799439001/comments/507f1f77bcf86cd799439022',
      )
      .send({ body: 'Updated' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You can only edit your own comments.');
    expect(review.save).not.toHaveBeenCalled();
  });

  it('allows comment edits when authorId matches even if username changed', async () => {
    const comment = {
      _id: '507f1f77bcf86cd799439022',
      authorId: '507f1f77bcf86cd799439011',
      author: 'old-alice',
      body: 'Original',
      isEdited: false,
    };
    const review = makeReview({
      comments: {
        id: vi.fn().mockReturnValue(comment),
      },
    });
    mockFindById(review);

    const res = await request(app)
      .put(
        '/api/reviews/507f1f77bcf86cd799439001/comments/507f1f77bcf86cd799439022',
      )
      .send({ body: 'Updated' });

    expect(res.status).toBe(200);
    expect(comment.body).toBe('Updated');
    expect(comment.isEdited).toBe(true);
    expect(review.save).toHaveBeenCalled();
  });
});
