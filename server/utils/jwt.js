const jwt = require('jsonwebtoken')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  companyName: user.companyName,
  age: user.age,
  cgpa: user.cgpa,
  university: user.university,
  department: user.department,
  github: user.github,
  linkedin: user.linkedin,
  bio: user.bio,
  profileCompletion: user.profileCompletion,
})

module.exports = { generateToken, formatUser }
