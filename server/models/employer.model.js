const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyEmail: {
    type: String,
    required: true
  },
  industry: String,
  companySize: String,
  website: String,
  description: String,
  location: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employer', employerSchema);