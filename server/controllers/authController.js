const User = require('../models/User')
const { generateToken, formatUser } = require('../utils/jwt')

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, role, companyName })
    const token = generateToken(user._id)

    res.status(201).json({ token, user: formatUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const match = await user.matchPassword(password)
    if (!match) return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user._id)
    res.json({ token, user: formatUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { register, login, getMe }
