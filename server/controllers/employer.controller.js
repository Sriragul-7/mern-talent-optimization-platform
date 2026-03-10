const User = require('../models/User')
const Skill = require('../models/Skill')
const Project = require('../models/Project')
const Certification = require('../models/Certification')
const { computeReadiness } = require('../utils/readiness')
const { formatUser } = require('../utils/jwt')

// GET /api/employer/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalStudents, allSkills] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Skill.find(),
    ])

    const activeSkills = new Set(allSkills.map(s => s.name)).size

    const students = await User.find({ role: 'student', cgpa: { $exists: true, $ne: null } }, 'cgpa')
    const avgCgpa = students.length
      ? (students.reduce((sum, s) => sum + (s.cgpa || 0), 0) / students.length).toFixed(1)
      : 0

    const uniList = await User.distinct('university', { role: 'student', university: { $exists: true, $ne: '' } })

    // Top 8 skills
    const topSkills = await Skill.aggregate([
      { $group: { _id: '$name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ])

    // New students this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const newThisMonth = await User.countDocuments({ role: 'student', createdAt: { $gte: startOfMonth } })

    res.json({
      totalStudents,
      activeSkills,
      avgCgpa: parseFloat(avgCgpa),
      universities: uniList.length,
      topSkills,
      newThisMonth,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/employer/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/employer/profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'companyName', 'industry', 'location', 'website', 'description']
    const updates = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/employer/search
const searchTalent = async (req, res) => {
  try {
    const { q, skill, university, minCgpa, role: targetRole = 'Full Stack Developer', sortBy = 'match', page = 1, limit = 20 } = req.query

    const filter = { role: 'student' }
    if (university) filter.university = university
    if (minCgpa)    filter.cgpa = { $gte: parseFloat(minCgpa) }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
      ]
    }

    let studentIds = null
    if (skill) {
      const matched = await Skill.find({ name: { $regex: skill, $options: 'i' } }).distinct('student')
      studentIds = matched
      filter._id = { $in: matched }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [students, total] = await Promise.all([
      User.find(filter).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ])

    // Fetch intelligence data for all students
    const studentIdsArr = students.map(s => s._id)
    const [allSkills, allProjects, allCerts] = await Promise.all([
      Skill.find({ student: { $in: studentIdsArr } }),
      Project.find({ student: { $in: studentIdsArr } }),
      Certification.find({ student: { $in: studentIdsArr } }),
    ])

    // Group by student ID
    const skillsMap = {}, projectsMap = {}, certsMap = {}
    allSkills.forEach(s => { if (!skillsMap[s.student]) skillsMap[s.student] = []; skillsMap[s.student].push(s) })
    allProjects.forEach(p => { if (!projectsMap[p.student]) projectsMap[p.student] = []; projectsMap[p.student].push(p) })
    allCerts.forEach(c => { if (!certsMap[c.student]) certsMap[c.student] = []; certsMap[c.student].push(c) })

    // Compute readiness per student
    const results = students.map(student => {
      const sId = student._id.toString()
      const skills    = skillsMap[sId]    || []
      const projects  = projectsMap[sId]  || []
      const certs     = certsMap[sId]     || []
      const readiness = computeReadiness(student, skills, projects, certs, targetRole)
      return {
        ...formatUser(student),
        readinessScore:    readiness.total,
        readinessGrade:    readiness.grade,
        matchedSkillCount: readiness.matchedSkills.length,
        skillCount:        skills.length,
        projectCount:      projects.length,
      }
    })

    // Sort
    results.sort((a, b) =>
      sortBy === 'cgpa'
        ? (b.cgpa || 0) - (a.cgpa || 0)
        : b.readinessScore - a.readinessScore
    )

    res.json({ students: results, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/employer/student/:id
const getStudentProfile = async (req, res) => {
  try {
    const targetRole = req.query.role || 'Full Stack Developer'
    const student = await User.findById(req.params.id)
    if (!student || student.role !== 'student') return res.status(404).json({ message: 'Student not found' })

    const [skills, projects, certs] = await Promise.all([
      Skill.find({ student: student._id }),
      Project.find({ student: student._id }),
      Certification.find({ student: student._id }),
    ])

    const readiness = computeReadiness(student, skills, projects, certs, targetRole)

    res.json({ student: formatUser(student), skills, projects, certifications: certs, readiness })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/employer/stats
const getPlatformStats = async (req, res) => {
  try {
    const [totalStudents, totalEmployers, totalSkills, totalProjects] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'employer' }),
      Skill.countDocuments(),
      Project.countDocuments(),
    ])
    res.json({ totalStudents, totalEmployers, totalSkills, totalProjects })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getDashboard, getProfile, updateProfile, searchTalent, getStudentProfile, getPlatformStats }
