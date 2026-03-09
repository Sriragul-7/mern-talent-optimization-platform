const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['Achievement', 'Event', 'Publication', 'Other'],
    default: 'Achievement'
  },
  date: Date,
  organization: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);