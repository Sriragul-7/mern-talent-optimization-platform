const express = require('express')
const router  = express.Router()
const { protect, requireRole } = require('../middleware/auth')
const ctrl = require('../controllers/adminController')

// All admin routes require auth + admin role
router.use(protect, requireRole('admin'))

router.get('/stats',                    ctrl.getStats)
router.get('/employers',                ctrl.getEmployers)
router.get('/employers/:id/proof',      ctrl.getProofDocument)
router.put('/employers/:id/approve',    ctrl.approveEmployer)
router.put('/employers/:id/reject',     ctrl.rejectEmployer)

module.exports = router
