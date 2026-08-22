const express = require('express');

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask
} = require('../controllers/taskController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// All task routes require authentication
router.use(protect);

// Get all tasks / Create task
router.route('/')
  .get(getTasks)
  .post(createTask);

// Update / Delete task
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

// Move task
router.route('/:id/move')
  .put(moveTask);

module.exports = router;