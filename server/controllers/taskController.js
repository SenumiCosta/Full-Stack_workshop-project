const Task = require('../models/Task');
const Board = require('../models/Board');

// @desc    Get all tasks for a board
// @route   GET /api/boards/:boardId/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Only board owner or member can access tasks
    const isMember =
      board.owner.toString() === req.user._id.toString() ||
      board.members.some(
        member => member.toString() === req.user._id.toString()
      );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this board'
      });
    }

    const tasks = await Task.find({
      board: req.params.boardId
    })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Get single task
// @route   GET /api/boards/:boardId/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      board: req.params.boardId
    }).populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Create task
// @route   POST /api/boards/:boardId/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const isMember =
      board.owner.toString() === req.user._id.toString() ||
      board.members.some(
        member => member.toString() === req.user._id.toString()
      );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks on this board'
      });
    }

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo,
      board: req.params.boardId
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Update task
// @route   PUT /api/boards/:boardId/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      board: req.params.boardId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;
    task.priority = req.body.priority ?? task.priority;
    task.dueDate = req.body.dueDate ?? task.dueDate;
    task.assignedTo = req.body.assignedTo ?? task.assignedTo;

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Delete task
// @route   DELETE /api/boards/:boardId/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      board: req.params.boardId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};