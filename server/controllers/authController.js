const User = require('../models/User')
const { generateToken, formatUser } = require('../utils/jwt')

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const userData = { name, email, password, role }
    if (role === 'employer') {
      if (!companyName) return res.status(400).json({ message: 'Company name is required for employer accounts' })
      userData.companyName = companyName
      // Employers start as 'pending' — uncomment below to enforce verification:
      // userData.employerStatus = 'pending'
    }

    const user = await User.create(userData)
    const token = generateToken(user._id)

    res.status(201).json({ token, user: formatUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const match = await user.matchPassword(password)
    if (!match) return res.status(401).json({ message: 'Invalid email or password' })

    // Block pending employers
    if (user.role === 'employer' && user.employerStatus === 'pending') {
      return res.status(403).json({
        message: 'Your employer account is pending verification by the SkillBridge team. You will receive an email once approved.',
        code: 'EMPLOYER_PENDING',
      })
    }

    if (user.role === 'employer' && user.employerStatus === 'rejected') {
      return res.status(403).json({
        message: 'Your employer application was not approved. Please contact support@skillbridge.in for more information.',
        code: 'EMPLOYER_REJECTED',
      })
    }

    const token = generateToken(user._id)
    res.json({ token, user: formatUser(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/register-employer  (with multer PDF proof)
const registerEmployer = async (req, res) => {
  try {
    const { name, email, password, companyName, industry, location, website } = req.body

    if (!req.file) {
      return res.status(400).json({ message: 'Company proof document (PDF) is required.' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const proofDocumentPath = req.file.filename

    const user = await User.create({
      name, email, password,
      role: 'employer',
      companyName,
      industry:  industry  || '',
      location:  location  || '',
      website:   website   || '',
      proofDocument: proofDocumentPath,
      employerStatus: 'pending', // must be approved by SkillBridge admin
    })

    // Don't issue a JWT — employer must wait for approval
    res.status(201).json({
      message: 'Application submitted. You will receive an email once your account is approved.',
      email: user.email,
      status: 'pending',
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { register, registerEmployer, login, getMe }
