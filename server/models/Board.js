const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a board name'],
    trim: true,
    maxlength: [50, 'Board name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

BoardSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Board', BoardSchema);