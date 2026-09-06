const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Not Started', 'Doing', 'Done'],
    default: 'Not Started'
  },
  assignee: {
    type: String,
    default: 'Unassigned'
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  dueDate: {
    type: Date
  },
  history: [{
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

TaskSchema.index({ board: 1, status: 1, order: 1 });

module.exports = mongoose.model('Task', TaskSchema);