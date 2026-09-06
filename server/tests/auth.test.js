const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Auth API Tests', () => {
  const testEmail = `authtest_${Date.now()}@example.com`;

  beforeEach(async () => {
    await User.deleteMany({ email: /authtest/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /authtest/ });
    await mongoose.connection.close();
  });

  test('POST /api/auth/register should register a new user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Auth Test User',
        email: testEmail,
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
  });

  test('POST /api/auth/login should log in registered user with valid credentials', async () => {
    await User.create({
      name: 'Login User',
      email: testEmail,
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
