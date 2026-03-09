const express = require('express')
const router  = express.Router()
const { protect, requireRole } = require('../middleware/auth')
const ctrl = require('../controllers/employerController')

router.use(protect, requireRole('employer'))

router.get('/dashboard',    ctrl.getDashboard)
router.get('/search',       ctrl.searchTalent)
router.get('/student/:id',  ctrl.getStudentProfile)
router.get('/stats',        ctrl.getPlatformStats)

module.exports = router
