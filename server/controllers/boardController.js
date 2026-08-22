const Board = require('../models/Board');

// Get all boards for logged-in user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id }
      ]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get single board
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) {
      return res.status(404).json({
        message: 'Board not found'
      });
    }

    const userId = req.user.id.toString();

    const isOwner = board.owner._id.toString() === userId;
    const isMember = board.members.some(
      member => member._id.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: 'Not authorized to access this board'
      });
    }

    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Create a new board
exports.createBoard = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Board name is required'
      });
    }

    const board = await Board.create({
      name: name.trim(),
      owner: req.user.id,
      members: []
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populatedBoard);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update a board
exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found'
      });
    }

    if (board.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'Only the board owner can update this board'
      });
    }

    board.name = req.body.name || board.name;

    const updatedBoard = await board.save();

    const populatedBoard = await Board.findById(updatedBoard._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json(populatedBoard);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete a board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        message: 'Board not found'
      });
    }

    if (board.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'Only the board owner can delete this board'
      });
    }

    await board.deleteOne();

    res.status(200).json({
      message: 'Board deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};