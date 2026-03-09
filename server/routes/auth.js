const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { register, login, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'employer']).withMessage('Role must be student or employer'),
], validate, register)

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login)

// GET /api/auth/me
router.get('/me', protect, getMe)

module.exports = router
