const Board = require('../models/Board');
const Task = require('../models/Task');

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id }
      ],
      isArchived: false
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: boards.length,
      data: boards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const isOwner = board.owner._id.toString() === req.user.id;
    const isMember = board.members.some(m => m._id.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this board'
      });
    }

    res.status(200).json({
      success: true,
      data: board
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      name: req.body.name,
      description: req.body.description || '',
      owner: req.user.id,
      members: req.body.members || [],
      color: req.body.color || '#6366f1'
    });

    res.status(201).json({
      success: true,
      data: board
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    let board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only board owner can update'
      });
    }

    board = await Board.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: board
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only board owner can delete'
      });
    }

    await Task.deleteMany({ board: req.params.id });
    await board.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Board and all tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};