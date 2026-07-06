import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { College } from '../src/models';

describe('Colleges API Endpoint Testing', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduvista_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await College.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await College.deleteMany({});
  });

  const mockCollege = {
    name: 'Indian Institute of Technology Delhi',
    slug: 'indian-institute-of-technology-delhi',
    shortDescription: 'Premium engineering institute in Delhi.',
    fullDescription: 'Indian Institute of Technology Delhi is a public technical university located in New Delhi, India.',
    establishedYear: 1961,
    collegeType: 'public',
    ownership: 'Government',
    location: {
      address: 'Hauz Khas',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110016',
      coordinates: { latitude: 28.545, longitude: 77.193 },
    },
    rating: 4.8,
    status: 'published',
  };

  describe('GET /api/v1/colleges', () => {
    it('should retrieve a list of published colleges', async () => {
      // Save a college profile
      await new College(mockCollege).save();

      const res = await request(app).get('/api/v1/colleges');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe(mockCollege.name);
    });

    it('should filter out unpublished or draft colleges', async () => {
      // Save draft college profile
      await new College({ ...mockCollege, name: 'Draft College', slug: 'draft-college', status: 'draft' }).save();

      const res = await request(app).get('/api/v1/colleges');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/colleges/:slug', () => {
    it('should retrieve detailed information of a college by slug', async () => {
      await new College(mockCollege).save();

      const res = await request(app).get(`/api/v1/colleges/${mockCollege.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(mockCollege.name);
      expect(res.body.data.location.city).toBe(mockCollege.location.city);
    });

    it('should return 404 if college slug is not found', async () => {
      const res = await request(app).get('/api/v1/colleges/non-existent-college-slug');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('COLLEGE_NOT_FOUND');
    });
  });
});
