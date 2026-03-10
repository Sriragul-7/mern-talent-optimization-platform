const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'employer', 'admin'],
    default: 'student',
  },

  // ── Employer-specific ──────────────────────────────────────────────────────
  companyName:  { type: String, trim: true },
  industry:     { type: String, trim: true },
  location:     { type: String, trim: true },
  website:      { type: String, trim: true },
  description:  { type: String, trim: true },

  // Employer verification status
  // 'approved' → can login and use portal
  // 'pending'  → registered but not yet verified by SkillBridge team
  // 'rejected' → application denied
  employerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', // set to 'pending' when full verification is enforced
  },

  // Proof PDF filename (employer only)
  proofDocument: { type: String },

  // ── Student-specific ──────────────────────────────────────────────────────
  age:        { type: Number },
  cgpa:       { type: Number, min: 0, max: 10 },
  university: { type: String, trim: true },
  department: { type: String, trim: true },
  github:     { type: String, trim: true },
  linkedin:   { type: String, trim: true },
  bio:        { type: String, trim: true },

}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

// Virtual: profileCompletion (students only)
userSchema.virtual('profileCompletion').get(function () {
  if (this.role !== 'student') return 100
  const fields = ['name', 'age', 'email', 'cgpa', 'university', 'department', 'github', 'linkedin']
  const filled = fields.filter(f => this[f] && String(this[f]).trim()).length
  return Math.round((filled / fields.length) * 100)
})

userSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('User', userSchema)
