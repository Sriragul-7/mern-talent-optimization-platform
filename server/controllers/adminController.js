const path = require('path')
const fs   = require('fs')
const User = require('../models/User')
const { formatUser } = require('../utils/jwt')

// GET /api/admin/employers?status=pending|approved|rejected|all
const getEmployers = async (req, res) => {
  try {
    const { status = 'pending' } = req.query
    const filter = { role: 'employer' }
    if (status !== 'all') filter.employerStatus = status
    const employers = await User.find(filter).sort({ createdAt: -1 })
    res.json(employers.map(formatUser))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/employers/:id/approve
const approveEmployer = async (req, res) => {
  try {
    const employer = await User.findOne({ _id: req.params.id, role: 'employer' })
    if (!employer) return res.status(404).json({ message: 'Employer not found' })
    employer.employerStatus = 'approved'
    await employer.save()
    res.json({ message: 'Employer approved', employer: formatUser(employer) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/employers/:id/reject
const rejectEmployer = async (req, res) => {
  try {
    const { reason } = req.body
    const employer = await User.findOne({ _id: req.params.id, role: 'employer' })
    if (!employer) return res.status(404).json({ message: 'Employer not found' })
    employer.employerStatus = 'rejected'
    if (reason) employer.rejectionReason = reason
    await employer.save()
    res.json({ message: 'Employer rejected', employer: formatUser(employer) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/employers/:id/proof  — serve the proof PDF
const getProofDocument = async (req, res) => {
  try {
    const employer = await User.findOne({ _id: req.params.id, role: 'employer' }).select('+proofDocumentData')
    if (!employer || !employer.proofDocument) {
      return res.status(404).json({ message: 'Proof document not found' })
    }

    if (employer.proofDocumentData?.length) {
      res.setHeader('Content-Type', employer.proofDocumentMimeType || 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${employer.proofDocument}"`)
      return res.send(employer.proofDocumentData)
    }

    const filePath = path.join(__dirname, '../uploads/proofs', employer.proofDocument)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' })
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${employer.proofDocument}"`)
    fs.createReadStream(filePath).pipe(res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalStudents, totalEmployers, pendingEmployers, approvedEmployers, rejectedEmployers] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'employer' }),
        User.countDocuments({ role: 'employer', employerStatus: 'pending' }),
        User.countDocuments({ role: 'employer', employerStatus: 'approved' }),
        User.countDocuments({ role: 'employer', employerStatus: 'rejected' }),
      ])
    res.json({ totalStudents, totalEmployers, pendingEmployers, approvedEmployers, rejectedEmployers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getEmployers, approveEmployer, rejectEmployer, getProofDocument, getStats }
