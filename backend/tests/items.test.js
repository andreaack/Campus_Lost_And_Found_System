const request = require('supertest');
const app = require('../server');
const Item = require('../models/Item');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Item Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    const uri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;
    await mongoose.connect(uri);

    // Create a test user and get token
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        studentId: '12345'
      });

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await Item.deleteMany({});
    await User.deleteMany({ email: /test@example.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up items before each test
    await Item.deleteMany({});
  });

  describe('POST /api/v1/items', () => {
    it('should create a new item', async () => {
      const res = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'lost',
          name: 'Blue Laptop',
          description: '15-inch ASUS laptop with sticker',
          category: 'electronics',
          location: 'Library 2nd floor',
          dateLostFound: '2026-05-22'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Blue Laptop');
      expect(res.body.data.type).toBe('lost');
      expect(res.body.data.reportedBy).toBe(userId);
    });

    it('should not create item without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/items')
        .send({
          type: 'lost',
          name: 'Blue Laptop',
          description: '15-inch ASUS laptop',
          category: 'electronics',
          location: 'Library',
          dateLostFound: '2026-05-22'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'lost',
          name: 'Blue Laptop'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/items', () => {
    beforeEach(async () => {
      // Create test items
      await Item.create([
        {
          type: 'lost',
          name: 'Blue Laptop',
          description: '15-inch ASUS laptop',
          category: 'electronics',
          location: 'Library',
          status: 'approved',
          reportedBy: userId,
          dateLostFound: new Date('2026-05-22')
        },
        {
          type: 'found',
          name: 'Red Wallet',
          description: 'Leather wallet with ID',
          category: 'accessories',
          location: 'Cafeteria',
          status: 'pending',
          reportedBy: userId,
          dateLostFound: new Date('2026-05-22')
        }
      ]);
    });

    it('should get all items (pending and approved)', async () => {
      const res = await request(app)
        .get('/api/v1/items');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should paginate items', async () => {
      const res = await request(app)
        .get('/api/v1/items?page=1&limit=1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/v1/items/mine', () => {
    beforeEach(async () => {
      await Item.create({
        type: 'lost',
        name: 'My Item',
        description: 'Test item',
        category: 'electronics',
        location: 'Library',
        status: 'approved',
        reportedBy: userId,
        dateLostFound: new Date('2026-05-22')
      });
    });

    it('should get user\'s own items', async () => {
      const res = await request(app)
        .get('/api/v1/items/mine')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].reportedBy).toBe(userId);
    });

    it('should not get items without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/items/mine');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/items/search', () => {
    beforeEach(async () => {
      await Item.create([
        {
          type: 'lost',
          name: 'Blue Laptop',
          description: '15-inch ASUS laptop',
          category: 'electronics',
          location: 'Library',
          status: 'approved',
          reportedBy: userId,
          dateLostFound: new Date('2026-05-22')
        },
        {
          type: 'found',
          name: 'Red Wallet',
          description: 'Leather wallet',
          category: 'accessories',
          location: 'Cafeteria',
          status: 'approved',
          reportedBy: userId,
          dateLostFound: new Date('2026-05-22')
        }
      ]);
    });

    it('should search items by name', async () => {
      const res = await request(app)
        .get('/api/v1/items/search?q=laptop');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toContain('Laptop');
    });

    it('should return 400 without search query', async () => {
      const res = await request(app)
        .get('/api/v1/items/search');

      expect(res.statusCode).toBe(400);
    });
  });
});
