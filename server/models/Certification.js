const mongoose = require('mongoose')

const certificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name:         { type: String, required: true, trim: true },
  issuer:       { type: String, required: true, trim: true },
  date:         { type: Date },
  credentialId: { type: String, trim: true },
  url:          { type: String, trim: true },
}, { timestamps: true })

module.exports = mongoose.model('Certification', certificationSchema)
