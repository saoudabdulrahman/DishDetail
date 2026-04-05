import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import authRouter from '../routes/auth.js';
import User from '../model/User.js';

vi.mock('../model/User.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

// Setup a mock Express app to mount the router
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('returns 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'missing_fields' }); // missing email and password

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required fields.');
    });

    it('returns 409 if username is taken', async () => {
      // Mock existing user check
      User.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          username: 'existinguser',
          email: 'other@example.com',
        }),
      });

      const res = await request(app).post('/api/auth/signup').send({
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('That username is already taken.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 401 on invalid username mapping', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wronguser', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid username or password.');
    });

    it.todo(
      'returns 401 on bad password - needs to be updated after bcrypt is implemented',
    );
  });
});
