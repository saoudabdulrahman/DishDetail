import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const uploadStream = vi.hoisted(() =>
  vi.fn((_options, callback) => ({
    end: vi.fn(() =>
      callback(null, {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/x.webp',
        public_id: 'dishdetail_reviews/x',
      }),
    ),
  })),
);

vi.mock('../utils/auth.js', () => ({
  verifyToken: (req, _res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011', username: 'alice' };
    return next();
  },
}));

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: { upload_stream: uploadStream },
  },
}));

import uploadRouter from '../routes/upload.js';

const app = express();
app.use('/api/upload', uploadRouter);

describe('Upload route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects non-image MIME types', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from('not an image'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Only JPEG, PNG, and WebP images are allowed.');
    expect(uploadStream).not.toHaveBeenCalled();
  });

  it('rejects images larger than 5MB', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'large.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Image must be 5MB or smaller.');
    expect(uploadStream).not.toHaveBeenCalled();
  });

  it('returns the Cloudinary URL and public id for valid images', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: 'valid.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      url: 'https://res.cloudinary.com/demo/image/upload/x.webp',
      publicId: 'dishdetail_reviews/x',
    });
  });
});
