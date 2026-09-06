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

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/move')
  .put(moveTask);

module.exports = router;