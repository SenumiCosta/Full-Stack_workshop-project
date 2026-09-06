const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');

describe('Task API Tests', () => {
  let token, boardId;

  beforeEach(async () => {
    await User.deleteMany({ email: /tasktest/ });
    await Board.deleteMany({ name: /TaskTest/ });

    const user = await User.create({
      name: 'Task Tester',
      email: `tasktest_${Date.now()}@example.com`,
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
      name: 'TaskTest Board',
      owner: user._id
    });

    boardId = board._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /tasktest/ });
    await Board.deleteMany({ name: /TaskTest/ });
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  test('POST /api/boards/:boardId/tasks should create a task', async () => {
    const res = await request(app)
      .post(`/api/boards/${boardId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Task',
        priority: 'High'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('New Task');
  });

  test('PUT /api/tasks/:id should update task and add history', async () => {
    const task = await Task.create({
      title: 'Old Title',
      board: boardId
    });

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated',
        status: 'Doing'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated');
    expect(res.body.data.history).toBeDefined();
  });

  test('DELETE /api/tasks/:id should delete task', async () => {
    const task = await Task.create({
      title: 'To delete',
      board: boardId
    });

    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});