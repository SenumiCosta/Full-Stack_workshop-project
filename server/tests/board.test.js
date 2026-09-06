const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Board = require('../models/Board');

describe('Board API Tests', () => {
  let token, userId;

  beforeEach(async () => {
    await User.deleteMany({ email: /boardtest/ });
    await Board.deleteMany({ name: /BoardTest/ });

    const user = await User.create({
      name: 'Board Tester',
      email: `boardtest_${Date.now()}@example.com`,
      password: 'password123'
    });
    userId = user._id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'password123'
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /boardtest/ });
    await Board.deleteMany({ name: /BoardTest/ });
    await mongoose.connection.close();
  });

  test('POST /api/boards should create a new personal board', async () => {
    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'BoardTest Alpha'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('BoardTest Alpha');
  });

  test('GET /api/boards should list boards for authenticated user', async () => {
    await Board.create({
      name: 'BoardTest Beta',
      owner: userId
    });

    const res = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(b => b.name === 'BoardTest Beta')).toBe(true);
  });
});
