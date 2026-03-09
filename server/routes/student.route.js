const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controllers/studentController');

router.use(auth);

router.get('/profile', studentController.getStudentProfile);
router.put('/profile', studentController.updateStudentProfile);

router.post('/skills', studentController.addSkill);
router.get('/skills', studentController.getSkills);

router.post('/projects', studentController.addProject);
router.get('/projects', studentController.getProjects);

router.post('/certifications', studentController.addCertification);
router.get('/certifications', studentController.getCertifications);

router.post('/achievements', studentController.addAchievement);
router.get('/achievements', studentController.getAchievements);

module.exports = router;