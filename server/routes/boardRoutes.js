const express = require('express');

const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard
} = require('../controllers/boardController');

const { protect } = require('../middleware/authMiddleware');
const taskRoutes = require('./taskRoutes');

const router = express.Router();

// All board routes require authentication
router.use(protect);

// Board routes
router.route('/')
  .get(getBoards)
  .post(createBoard);

router.route('/:id')
  .get(getBoard)
  .put(updateBoard)
  .delete(deleteBoard);

// Nested task routes
router.use('/:boardId/tasks', taskRoutes);

module.exports = router;