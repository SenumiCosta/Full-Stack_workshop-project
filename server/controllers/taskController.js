const Task = require('../models/Task');
const Board = require('../models/Board');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignee', 'name email')
      .populate('history.user', 'name')
      .sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }
    const lastTask = await Task.findOne({ board: req.params.boardId }).sort({ order: -1 });
    const task = await Task.create({
      ...req.body,
      board: req.params.boardId,
      order: lastTask ? lastTask.order + 1 : 0,
      history: [{
        text: `Task "${req.body.title}" created`,
        user: req.user.id,
        timestamp: new Date()
      }]
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    const changes = [];
    if (req.body.status && req.body.status !== task.status) {
      changes.push(`Status changed from "${task.status}" to "${req.body.status}"`);
    }
    if (req.body.priority && req.body.priority !== task.priority) {
      changes.push(`Priority changed from "${task.priority}" to "${req.body.priority}"`);
    }
    if (req.body.assignee && req.body.assignee !== task.assignee?.toString()) {
      changes.push('Assignee updated');
    }
    if (req.body.title && req.body.title !== task.title) {
      changes.push(`Title changed to "${req.body.title}"`);
    }
    if (req.body.description && req.body.description !== task.description) {
      changes.push('Description updated');
    }
    if (req.body._clientUpdatedAt) {
      const clientTime = new Date(req.body._clientUpdatedAt).getTime();
      const serverTime = new Date(task.updatedAt).getTime();
      if (serverTime > clientTime) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: 'Conflict detected - data has been modified by someone else',
          serverData: task,
          serverUpdatedAt: task.updatedAt
        });
      }
    }
    delete req.body._clientUpdatedAt;
    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignee', 'name');
    if (changes.length > 0) {
      task.history.push({
        text: changes.join(', '),
        user: req.user.id,
        timestamp: new Date()
      });
      await task.save();
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.moveTask = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    task.history.push({
      text: `Moved from "${task.status}" to "${status}"`,
      user: req.user.id,
      timestamp: new Date()
    });
    task.status = status;
    if (order !== undefined) task.order = order;
    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};