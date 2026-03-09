const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Soft Skill', 'Language', 'Other'],
    default: 'Technical'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Pro'],
    required: true
  },
  endorsements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Skill', skillSchema);