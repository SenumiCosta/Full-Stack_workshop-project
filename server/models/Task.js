const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
      index: true
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for quickly finding tasks in a board by status
TaskSchema.index({ board: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);