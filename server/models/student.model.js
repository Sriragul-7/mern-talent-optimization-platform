const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  github: String,
  linkedin: String,
  age: Number,
  university: String,
  department: String,
  cgpa: Number,
  avatar: String,
  totalProjects: {
    type: Number,
    default: 0
  },
  totalCertifications: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Pro'],
    default: 'Beginner'
  },
  points: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);