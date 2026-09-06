const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');

describe('Conflict Detection Tests', () => {
  let token, boardId, taskId;

  beforeEach(async () => {
    await User.deleteMany({ email: /conflicttest/ });
    await Board.deleteMany({ name: /ConflictTest/ });

    const user = await User.create({
      name: 'Conflict Tester',
      email: `conflicttest_${Date.now()}@example.com`,
      password: 'password123'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'password123'
      });

    token = loginRes.body.token;

    const board = await Board.create({
      name: 'ConflictTest Board',
      owner: user._id
    });

    boardId = board._id;

    const task = await Task.create({
      title: 'Original',
      board: boardId
    });

    taskId = task._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /conflicttest/ });
    await Board.deleteMany({ name: /ConflictTest/ });
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  test('should return 409 when client sends stale updatedAt', async () => {
    // Simulate server update to make the task newer
    await Task.findByIdAndUpdate(taskId, {
      title: 'Changed by server'
    });

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Client update',
        _clientUpdatedAt: new Date(Date.now() - 60000).toISOString()
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.conflict).toBe(true);
    expect(res.body.serverData.title).toBe('Changed by server');
  });
});