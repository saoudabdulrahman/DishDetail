import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import authRouter from '../routes/auth.js';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../model/User.js', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
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
      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
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

    it('returns token and user on successful signup', async () => {
      User.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });
      User.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        username: 'newuser',
        email: 'new@example.com',
        bio: '',
        role: 'user',
        ownedEstablishment: null,
      });

      const res = await request(app).post('/api/auth/signup').send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.user.username).toBe('newuser');
      expect(typeof res.body.token).toBe('string');
    });

    it('returns 400 for invalid email format', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        username: 'newuser',
        email: 'not-an-email',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Please enter a valid email.');
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

    it('returns 401 on bad password', async () => {
      User.findOne.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        username: 'tester',
        password: 'hashed_password',
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'tester', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid username or password.');
    });

    it('returns user and token on successful login', async () => {
      User.findOne.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        username: 'tester',
        email: 'tester@example.com',
        password: 'hashed_password',
        bio: '',
        role: 'user',
        ownedEstablishment: null,
      });
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'tester', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('tester');
      expect(typeof res.body.token).toBe('string');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without bearer token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns user with valid bearer token', async () => {
      const token = jwt.sign(
        { id: '507f1f77bcf86cd799439011', username: 'tester' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
      );
      User.findById.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        username: 'tester',
        email: 'tester@example.com',
        bio: '',
        role: 'user',
        ownedEstablishment: null,
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('tester');
    });
  });
});
