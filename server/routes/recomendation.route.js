const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

router.use(auth);

router.get('/skills', recommendationController.getSkillRecommendations);
router.get('/projects', recommendationController.getProjectRecommendations);

module.exports = router;