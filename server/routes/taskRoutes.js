const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask
} = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

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