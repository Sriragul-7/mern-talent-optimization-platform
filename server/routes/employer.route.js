const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const employerController = require('../controllers/employerController');

router.use(auth);

router.get('/profile', employerController.getEmployerProfile);
router.put('/profile', employerController.updateEmployerProfile);

router.get('/search', employerController.searchStudents);
router.get('/student/:studentId', employerController.getStudentDetails);

module.exports = router;