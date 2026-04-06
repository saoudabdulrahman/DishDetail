import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const { findOneAndUpdate, exists } = vi.hoisted(() => ({
  findOneAndUpdate: vi.fn(),
  exists: vi.fn(),
}));

vi.mock('../model/Review.js', () => ({
  default: { findOneAndUpdate, exists },
}));

vi.mock('../model/Establishment.js', () => ({
  default: {},
}));

vi.mock('../model/User.js', () => ({
  default: {},
}));

vi.mock('../utils/auth.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011', username: 'tester' };
    return next();
  },
}));

import reviewsRouter from '../routes/reviews.js';

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewsRouter);

describe('Review vote route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for invalid vote type', async () => {
    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid vote type.');
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('returns 404 when review does not exist', async () => {
    findOneAndUpdate.mockResolvedValue(null);
    exists.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'helpful' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Review not found.');
    expect(exists).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439001' });
  });

  it('increments helpful count and tracks voter for first helpful vote', async () => {
    findOneAndUpdate.mockResolvedValue({ helpfulCount: 3, unhelpfulCount: 1 });

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'helpful' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ helpfulCount: 3, unhelpfulCount: 1 });
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: '507f1f77bcf86cd799439001',
        helpfulVoters: { $ne: '507f1f77bcf86cd799439011' },
        unhelpfulVoters: { $ne: '507f1f77bcf86cd799439011' },
      },
      {
        $inc: { helpfulCount: 1 },
        $addToSet: { helpfulVoters: '507f1f77bcf86cd799439011' },
      },
      { new: true },
    );
  });

  it('increments unhelpful count and tracks voter for first unhelpful vote', async () => {
    findOneAndUpdate.mockResolvedValue({ helpfulCount: 2, unhelpfulCount: 2 });

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'unhelpful' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ helpfulCount: 2, unhelpfulCount: 2 });
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: '507f1f77bcf86cd799439001',
        helpfulVoters: { $ne: '507f1f77bcf86cd799439011' },
        unhelpfulVoters: { $ne: '507f1f77bcf86cd799439011' },
      },
      {
        $inc: { unhelpfulCount: 1 },
        $addToSet: { unhelpfulVoters: '507f1f77bcf86cd799439011' },
      },
      { new: true },
    );
  });

  it('returns 409 when user has already voted helpful', async () => {
    findOneAndUpdate.mockResolvedValue(null);
    exists.mockResolvedValue({ _id: '507f1f77bcf86cd799439001' });

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'helpful' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('You have already voted on this review.');
  });

  it('returns 409 when user has already voted unhelpful', async () => {
    findOneAndUpdate.mockResolvedValue(null);
    exists.mockResolvedValue({ _id: '507f1f77bcf86cd799439001' });

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'unhelpful' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('You have already voted on this review.');
  });

  it('returns 409 when user tries to vote both helpful and unhelpful', async () => {
    // First vote succeeds
    findOneAndUpdate.mockResolvedValueOnce({
      helpfulCount: 3,
      unhelpfulCount: 1,
    });

    await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'helpful' });

    // Second vote: findOneAndUpdate returns null because both $ne filters now exclude this voter
    findOneAndUpdate.mockResolvedValueOnce(null);
    exists.mockResolvedValue({ _id: '507f1f77bcf86cd799439001' });

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439001/vote')
      .send({ type: 'unhelpful' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('You have already voted on this review.');
  });
});
