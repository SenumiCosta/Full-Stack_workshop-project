const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Not Started', 'Doing', 'Done'],
    default: 'Not Started'
  },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  history: [{ text: String, timestamp: Date }]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);