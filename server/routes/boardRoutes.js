const express = require('express');

const {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard
} = require('../controllers/boardController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all boards
// POST create a board
router.route('/')
  .get(protect, getBoards)
  .post(protect, createBoard);

// PUT update a board
// DELETE a board
router.route('/:id')
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

module.exports = router;