const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { body } = require('express-validator')
const { register, registerEmployer, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')

// ── Multer config for employer proof PDFs ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/proofs'))
  },
  filename: (req, file, cb) => {
    // Use timestamp + original name to avoid collisions
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are accepted'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

// POST /api/auth/register  (student + quick employer)
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'employer']).withMessage('Role must be student or employer'),
], validate, register)

// POST /api/auth/register-employer  (employer with proof PDF upload)
router.post('/register-employer',
  upload.single('proofDocument'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
  ],
  validate,
  registerEmployer
)

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login)

// GET /api/auth/me
router.get('/me', protect, getMe)

module.exports = router
