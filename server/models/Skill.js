const mongoose = require('mongoose')

const LEVEL_MAP = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4, Master: 5 }

const skillSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name:     { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'],
    default: 'Intermediate',
  },
}, { timestamps: true })

skillSchema.virtual('levelNum').get(function () {
  return LEVEL_MAP[this.level] || 2
})

skillSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Skill', skillSchema)
