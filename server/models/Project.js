const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  tech:        [{ type: String, trim: true }],
  github:      { type: String, trim: true },
  live:        { type: String, trim: true },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed'],
    default: 'In Progress',
  },
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)
