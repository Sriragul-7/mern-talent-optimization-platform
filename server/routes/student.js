const express = require('express')
const router = express.Router()
const { protect, requireRole } = require('../middleware/auth')
const ctrl = require('../controllers/studentController')

router.use(protect, requireRole('student'))

// Profile
router.get('/profile',    ctrl.getProfile)
router.put('/profile',    ctrl.updateProfile)

// Skills
router.get('/skills',        ctrl.getSkills)
router.post('/skills',       ctrl.addSkill)
router.delete('/skills/:id', ctrl.deleteSkill)

// Projects
router.get('/projects',         ctrl.getProjects)
router.post('/projects',        ctrl.addProject)
router.put('/projects/:id',     ctrl.updateProject)
router.delete('/projects/:id',  ctrl.deleteProject)

// Certifications
router.get('/certifications',          ctrl.getCertifications)
router.post('/certifications',         ctrl.addCertification)
router.delete('/certifications/:id',   ctrl.deleteCertification)

// Analytics & intelligence
router.get('/dashboard',       ctrl.getDashboard)
router.get('/recommendations', ctrl.getRecommendations)
router.get('/skill-gap',       ctrl.getSkillGap)
router.get('/readiness',       ctrl.getReadiness)
router.get('/action-plan',     ctrl.getActionPlan)
router.get('/resume',          ctrl.getResume)
router.get('/compare',         ctrl.getCompare)

module.exports = router