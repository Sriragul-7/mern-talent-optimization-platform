const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [{
    type: String,
    required: true
  }],
  startDate: Date,
  endDate: Date,
  githubLink: String,
  liveLink: String,
  teamMembers: [{
    name: String,
    role: String
  }],
  highlights: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);