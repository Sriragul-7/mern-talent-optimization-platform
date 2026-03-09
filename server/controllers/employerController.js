const User = require('../models/User')
const Skill = require('../models/Skill')
const Project = require('../models/Project')
const Certification = require('../models/Certification')
const { computeReadiness } = require('../utils/readiness')

// GET /api/employer/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalStudents, allSkills] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Skill.find().populate('student', 'cgpa'),
    ])

    const activeSkills = new Set(allSkills.map(s => s.name)).size

    const students = await User.find({ role: 'student', cgpa: { $exists: true, $ne: null } }, 'cgpa')
    const avgCgpa = students.length
      ? (students.reduce((sum, s) => sum + (s.cgpa || 0), 0) / students.length).toFixed(1)
      : 0

    const uniList = await User.distinct('university', { role: 'student', university: { $exists: true, $ne: '' } })
    const universities = uniList.length

    const skillAgg = await Skill.aggregate([
      { $group: { _id: '$name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ])

    const cgpaRanges = [
      { range: '9-10', min: 9, max: 10 },
      { range: '8-9',  min: 8, max: 9  },
      { range: '7-8',  min: 7, max: 8  },
      { range: '6-7',  min: 6, max: 7  },
      { range: '<6',   min: 0, max: 6  },
    ]
    const cgpaDistribution = await Promise.all(cgpaRanges.map(async ({ range, min, max }) => {
      const count = await User.countDocuments({ role: 'student', cgpa: { $gte: min, $lt: max } })
      return { range, count }
    }))

    const now = new Date()
    const monthlyActivity = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
        return User.countDocuments({ role: 'student', createdAt: { $gte: d, $lte: end } })
          .then(value => ({ month: d.toLocaleString('default', { month: 'short' }), value }))
      })
    )

    res.json({ totalStudents, activeSkills, avgCgpa: parseFloat(avgCgpa), universities, topSkills: skillAgg, cgpaDistribution, monthlyActivity })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/employer/search?q=&skill=&university=&minCgpa=&role=&sortBy=match|cgpa
const searchTalent = async (req, res) => {
  try {
    const { q, skill, university, minCgpa, role, sortBy = 'match', page = 1, limit = 20 } = req.query

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
    if (skill) {
      const skillDocs = await Skill.find({ name: { $regex: skill, $options: 'i' } }).distinct('student')
      filter._id = { $in: skillDocs }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [rawStudents, total] = await Promise.all([
      User.find(filter, '-password').sort({ cgpa: -1 }).skip(skip).limit(parseInt(limit) * 3), // fetch extra for re-ranking
      User.countDocuments(filter),
    ])

    // Attach skills, projects, certs for scoring
    const studentIds = rawStudents.map(s => s._id)
    const [allSkills, allProjects, allCerts] = await Promise.all([
      Skill.find({ student: { $in: studentIds } }),
      Project.find({ student: { $in: studentIds } }),
      Certification.find({ student: { $in: studentIds } }),
    ])

    const skillsMap = {}
    allSkills.forEach(s => {
      const id = s.student.toString()
      if (!skillsMap[id]) skillsMap[id] = []
      skillsMap[id].push(s)
    })
    const projectsMap = {}
    allProjects.forEach(p => {
      const id = p.student.toString()
      if (!projectsMap[id]) projectsMap[id] = []
      projectsMap[id].push(p)
    })
    const certsMap = {}
    allCerts.forEach(c => {
      const id = c.student.toString()
      if (!certsMap[id]) certsMap[id] = []
      certsMap[id].push(c)
    })

    // Compute readiness score per student
    const targetRole = role || 'Full Stack Developer'
    const scored = rawStudents.map(s => {
      const sid = s._id.toString()
      const sSkills = skillsMap[sid] || []
      const sProjects = projectsMap[sid] || []
      const sCerts = certsMap[sid] || []
      const readiness = computeReadiness(s, sSkills, sProjects, sCerts, targetRole)
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        cgpa: s.cgpa,
        university: s.university,
        department: s.department,
        github: s.github,
        linkedin: s.linkedin,
        skills: sSkills.map(sk => sk.name),
        readinessScore: readiness.total,
        readinessGrade: readiness.grade,
        matchedSkillCount: readiness.matchedSkills.length,
      }
    })

    // Sort by match score or CGPA
    const sorted = sortBy === 'cgpa'
      ? scored.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0))
      : scored.sort((a, b) => b.readinessScore - a.readinessScore)

    // Paginate after ranking
    const paginated = sorted.slice(0, parseInt(limit))

    res.json({ students: paginated, total, page: parseInt(page), pages: Math.ceil(total / limit), targetRole })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/employer/student/:id
const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }, '-password')
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const [skills, projects, certs] = await Promise.all([
      Skill.find({ student: student._id }),
      Project.find({ student: student._id }),
      Certification.find({ student: student._id }),
    ])

    // Compute readiness for employer's context
    const role = req.query.role || 'Full Stack Developer'
    const readiness = computeReadiness(student, skills, projects, certs, role)

    res.json({ student, skills, projects, certifications: certs, readiness })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/employer/stats
const getPlatformStats = async (req, res) => {
  try {
    const [totalStudents, totalEmployers, totalSkills, totalProjects, totalCerts] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'employer' }),
      Skill.countDocuments(),
      Project.countDocuments(),
      Certification.countDocuments(),
    ])
    res.json({ totalStudents, totalEmployers, totalSkills, totalProjects, totalCerts })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { getDashboard, searchTalent, getStudentProfile, getPlatformStats }
