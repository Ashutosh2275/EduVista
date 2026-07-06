import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models';

describe('Authentication & Authorization Flow', () => {
  beforeAll(async () => {
    // Connect to test database before running tests
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduvista_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Cleanup and close connection
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const mockUser = {
    name: 'Test Student',
    email: 'student@example.com',
    phone: '9876543210',
    password: 'Password@123',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new student account successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(mockUser.email.toLowerCase());
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 400 validation error if email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...mockUser, email: 'notanemail' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 conflict if email already exists', async () => {
      // Register first user
      await request(app).post('/api/v1/auth/register').send(mockUser);

      // Register duplicate
      const res = await request(app).post('/api/v1/auth/register').send(mockUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Register user before testing login
      await request(app).post('/api/v1/auth/register').send(mockUser);
    });

    it('should authenticate user and return access token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 if password does not match', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockUser.email,
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
