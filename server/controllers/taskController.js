const Task = require('../models/Task');
const Board = require('../models/Board');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignee', 'name email')
      .populate('history.user', 'name')
      .sort({ order: 1, createdAt: -1 });

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

<<<<<<< HEAD

// @desc    Get single task
// @route   GET /api/boards/:boardId/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      board: req.params.boardId
    }).populate('assignedTo', 'name email');
=======
exports.createTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const lastTask = await Task.findOne({ board: req.params.boardId })
      .sort({ order: -1 });

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

    res.status(201).json({
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

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
>>>>>>> origin/dev

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

<<<<<<< HEAD
=======
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

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('assignee', 'name');

    if (changes.length > 0) {
      task.history.push({
        text: changes.join(', '),
        user: req.user.id,
        timestamp: new Date()
      });
      await task.save();
    }

>>>>>>> origin/dev
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

<<<<<<< HEAD

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
=======
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
>>>>>>> origin/dev

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

<<<<<<< HEAD
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
=======
    await task.deleteOne();
>>>>>>> origin/dev

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

<<<<<<< HEAD

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
=======
exports.moveTask = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.history.push({
      text: `Moved from "${task.status}" to "${status}"`,
      user: req.user.id,
      timestamp: new Date()
    });

    task.status = status;
    if (order !== undefined) task.order = order;
    await task.save();

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
>>>>>>> origin/dev
};