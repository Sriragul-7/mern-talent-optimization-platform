const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'employer'])
], authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authController.login);

module.exports = router;