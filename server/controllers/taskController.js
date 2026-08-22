const Task = require('../models/Task');
const Board = require('../models/Board');

// Get all tasks for a board
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('board', 'name');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority } = req.body;

    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found'
      });
    }

    const userId = req.user.id.toString();

    const isOwner = board.owner.toString() === userId;

    const isMember = board.members.some(
      member => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: 'Not authorized to add tasks to this board'
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required'
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      board: req.params.boardId,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      status: status || 'todo',
      priority: priority || 'medium'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('board', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const board = await Board.findById(task.board);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found'
      });
    }

    const userId = req.user.id.toString();

    const isOwner = board.owner.toString() === userId;

    const isMember = board.members.some(
      member => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: 'Not authorized to update this task'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'assignedTo',
      'status',
      'priority'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('board', 'name');

    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const board = await Board.findById(task.board);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found'
      });
    }

    if (board.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'Only the board owner can delete tasks'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Move a task
exports.moveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const board = await Board.findById(task.board);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found'
      });
    }

    const userId = req.user.id.toString();

    const isOwner = board.owner.toString() === userId;

    const isMember = board.members.some(
      member => member.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: 'Not authorized to move this task'
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status is required'
      });
    }

    task.status = status;

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('board', 'name');

    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
