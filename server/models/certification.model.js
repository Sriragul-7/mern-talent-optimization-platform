const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  issueDate: Date,
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Certification', certificationSchema);