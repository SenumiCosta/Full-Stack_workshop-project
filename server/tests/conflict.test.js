const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');

describe('Conflict Detection Tests', () => {
  let token, boardId, taskId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test',
      email: 'conflict@example.com',
      password: 'pass123'
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'conflict@example.com',
        password: 'pass123'
      });

    token = login.body.token;

    const board = await Board.create({
      name: 'Conflict Board',
      owner: user._id
    });

    boardId = board._id;

    const task = await Task.create({
      title: 'Original',
      board: boardId
    });

    taskId = task._id;
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
        _clientUpdatedAt: new Date(
          Date.now() - 60000
        ).toISOString()
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.conflict).toBe(true);
    expect(res.body.serverData.title).toBe('Changed by server');
  });

  test('should succeed when client timestamp is current', async () => {
    const task = await Task.findById(taskId);

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated',
        _clientUpdatedAt: task.updatedAt.toISOString()
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated');
  });
});