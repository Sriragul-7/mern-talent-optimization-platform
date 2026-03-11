const User = require('../models/User')
const Skill = require('../models/Skill')
const Project = require('../models/Project')
const Certification = require('../models/Certification')
const { formatUser } = require('../utils/jwt')
const { generateRecommendations, analyseSkillGap } = require('../utils/recommendations')

const { 
  computeReadiness, 
  generateActionPlan, 
  computeAllRoles, 
  ROLE_SKILL_MAP, 
  AVAILABLE_ROLES 
} = require('../utils/readiness')
// ─── Profile ────────────────────────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(formatUser(user))
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'age', 'cgpa', 'university', 'department', 'github', 'linkedin', 'bio']
    const updates = {}
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field] })
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json(formatUser(user))
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Skills ─────────────────────────────────────────────────────────────────

const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ student: req.user._id }).sort({ createdAt: -1 })
    res.json(skills)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const addSkill = async (req, res) => {
  try {
    const { name, category, level } = req.body
    const skill = await Skill.create({ student: req.user._id, name, category, level })
    res.status(201).json(skill)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, student: req.user._id })
    if (!skill) return res.status(404).json({ message: 'Skill not found' })
    await skill.deleteOne()
    res.json({ message: 'Skill removed' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Projects ────────────────────────────────────────────────────────────────

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ student: req.user._id }).sort({ createdAt: -1 })
    res.json(projects)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const addProject = async (req, res) => {
  try {
    const { title, description, tech, github, live, status } = req.body
    const project = await Project.create({
      student: req.user._id, title, description,
      tech: Array.isArray(tech) ? tech : tech?.split(',').map(t => t.trim()).filter(Boolean),
      github, live, status,
    })
    res.status(201).json(project)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, student: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    const { title, description, tech, github, live, status } = req.body
    if (title)       project.title       = title
    if (description) project.description = description
    if (tech)        project.tech        = Array.isArray(tech) ? tech : tech.split(',').map(t => t.trim())
    if (github)      project.github      = github
    if (live !== undefined) project.live = live
    if (status)      project.status      = status
    await project.save()
    res.json(project)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, student: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    await project.deleteOne()
    res.json({ message: 'Project removed' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Certifications ──────────────────────────────────────────────────────────

const getCertifications = async (req, res) => {
  try {
    const certs = await Certification.find({ student: req.user._id }).sort({ date: -1 })
    res.json(certs)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const addCertification = async (req, res) => {
  try {
    const { name, issuer, date, credentialId, url } = req.body
    const cert = await Certification.create({ student: req.user._id, name, issuer, date, credentialId, url })
    res.status(201).json(cert)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const deleteCertification = async (req, res) => {
  try {
    const cert = await Certification.findOne({ _id: req.params.id, student: req.user._id })
    if (!cert) return res.status(404).json({ message: 'Certification not found' })
    await cert.deleteOne()
    res.json({ message: 'Certification removed' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

const getDashboard = async (req, res) => {
  try {
    const [user, skills, projects, certs] = await Promise.all([
      User.findById(req.user._id),
      Skill.find({ student: req.user._id }),
      Project.find({ student: req.user._id }),
      Certification.find({ student: req.user._id }),
    ])

    // Best readiness score across all roles
    const allRoles = computeAllRoles(user, skills, projects, certs)
    const bestRole = allRoles[0] || { role: 'Full Stack Developer', total: 0 }

    const categoryMap = {}
    skills.forEach(s => { categoryMap[s.category] = (categoryMap[s.category] || 0) + 1 })
    const skillsByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

    const LEVEL_PCT = { Beginner: 20, Intermediate: 40, Advanced: 70, Expert: 90, Master: 100 }
    const radarMap = {}
    skills.forEach(s => {
      if (!radarMap[s.category]) radarMap[s.category] = []
      radarMap[s.category].push(LEVEL_PCT[s.level] || 40)
    })
    const skillDistribution = Object.entries(radarMap).map(([skill, vals]) => ({
      skill, value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }))

    const skillProgressBars = skills.map(s => ({ name: s.name, level: s.levelNum }))

    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), idx: i }
    })
    const skillProgress = await Promise.all(months.map(async ({ month, year, idx }) => {
      const end = new Date(year, new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1).getMonth() + 1, 0)
      const count = await Skill.countDocuments({ student: req.user._id, createdAt: { $lte: end } })
      return { month, value: count }
    }))

    res.json({
      skills: skills.length,
      projects: projects.length,
      certifications: certs.length,
      profileCompletion: user.profileCompletion,
      readinessScore: bestRole.total,
      readinessRole: bestRole.role,
      readinessGrade: bestRole.grade,
      allRoles,
      skillDistribution,
      skillsByCategory,
      skillProgressBars,
      skillProgress,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

const getRecommendations = async (req, res) => {
  try {
    const [user, skills, projects, certs] = await Promise.all([
      User.findById(req.user._id),
      Skill.find({ student: req.user._id }),
      Project.find({ student: req.user._id }),
      Certification.find({ student: req.user._id }),
    ])
    const recommendations = generateRecommendations(user, skills, projects, certs)
    res.json(recommendations)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Skill Gap ────────────────────────────────────────────────────────────────

const getSkillGap = async (req, res) => {
  try {
    const targetRole = req.query.role || 'Full Stack Developer'
    const [user, skills, projects, certs] = await Promise.all([
      User.findById(req.user._id),
      Skill.find({ student: req.user._id }),
      Project.find({ student: req.user._id }),
      Certification.find({ student: req.user._id }),
    ])

    // Use readiness engine for richer gap data
    const readiness = computeReadiness(user, skills, projects, certs, targetRole)

    // Also compute simple gap data for backward compat
    const legacyGap = analyseSkillGap(skills, targetRole)

    res.json({
      targetRole,
      match: readiness.total,
      gaps: readiness.missingSkills.map(g => ({
        skill: g.skill,
        importance: g.importance,
        current: 0,
        required: 3,
        impact: g.impact,
      })),
      strengths: readiness.matchedSkills.map(s => s.name),
      breakdown: readiness.breakdown,
      grade: readiness.grade,
      availableRoles: AVAILABLE_ROLES,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Readiness Score ─────────────────────────────────────────────────────────

// GET /api/student/readiness?role=
const getReadiness = async (req, res) => {
  try {
    const role = req.query.role || 'Full Stack Developer'
    const [user, skills, projects, certs] = await Promise.all([
      User.findById(req.user._id),
      Skill.find({ student: req.user._id }),
      Project.find({ student: req.user._id }),
      Certification.find({ student: req.user._id }),
    ])
    const readiness = computeReadiness(user, skills, projects, certs, role)
    const allRoles = computeAllRoles(user, skills, projects, certs)
    res.json({ ...readiness, allRoles, availableRoles: AVAILABLE_ROLES })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Action Plan ─────────────────────────────────────────────────────────────

// GET /api/student/action-plan?role=
const getActionPlan = async (req, res) => {
  try {
    const role = req.query.role || 'Full Stack Developer'
    const [user, skills, projects, certs] = await Promise.all([
      User.findById(req.user._id),
      Skill.find({ student: req.user._id }),
      Project.find({ student: req.user._id }),
      Certification.find({ student: req.user._id }),
    ])
    const readiness = computeReadiness(user, skills, projects, certs, role)
    const plan = generateActionPlan(readiness, user, projects, certs)

    res.json({
      role,
      currentScore: readiness.total,
      grade: readiness.grade,
      potentialScore: Math.min(100, readiness.total + plan.reduce((sum, s) => sum + s.impact, 0)),
      steps: plan,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Resume ───────────────────────────────────────────────────────────────────

const getResume = async (req, res) => {
  try {
    const [user, skills, projects, certs] = await Promise.all([
      User.findById(req.user._id),
      Skill.find({ student: req.user._id }),
      Project.find({ student: req.user._id }),
      Certification.find({ student: req.user._id }),
    ])
    res.json({ user: formatUser(user), skills, projects, certifications: certs })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// ─── Compare (platform benchmark) ────────────────────────────────────────────
// GET /api/student/compare

const LEVEL_NUM = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4, Master: 4 }

const getCompare = async (req, res) => {
  try {
    const [user, mySkills, myProjects, myCerts, totalStudents] = await Promise.all([
      User.findById(req.user._id),
      Skill.find({ student: req.user._id }),
      Project.find({ student: req.user._id }),
      Certification.find({ student: req.user._id }),
      User.countDocuments({ role: 'student' }),
    ])

    // Platform-wide counts
    const allStudents = await User.find({ role: 'student' }, 'cgpa _id')
    const studentIds  = allStudents.map(s => s._id)

    const [allSkillDocs, allProjectCount, allCertCount] = await Promise.all([
      Skill.find({ student: { $in: studentIds } }, 'student name level'),
      Project.countDocuments({ student: { $in: studentIds } }),
      Certification.countDocuments({ student: { $in: studentIds } }),
    ])

    const skillsPerStudent = {}
    allSkillDocs.forEach(sk => {
      const id = sk.student.toString()
      if (!skillsPerStudent[id]) skillsPerStudent[id] = []
      skillsPerStudent[id].push(sk)
    })

    const n = totalStudents || 1
    const avgSkills   = Object.values(skillsPerStudent).reduce((s, a) => s + a.length, 0) / n
    const avgProjects = allProjectCount / n
    const avgCerts    = allCertCount    / n
    const cgpaList    = allStudents.map(s => s.cgpa).filter(Boolean)
    const avgCgpa     = cgpaList.length > 0 ? cgpaList.reduce((a, b) => a + b, 0) / cgpaList.length : 0

    // Per-skill level comparison
    const skillComparison = await Promise.all(
      mySkills.map(async sk => {
        const platformSkills = await Skill.find({ name: sk.name }, 'level')
        const levels = platformSkills.map(s => LEVEL_NUM[s.level] || 1)
        const platformAvg = levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : 1
        return {
          skill:             sk.name,
          yourLevel:         LEVEL_NUM[sk.level] || 1,
          yourLevelLabel:    sk.level,
          platformAvg:       parseFloat(platformAvg.toFixed(2)),
          studentsWithSkill: levels.length,
        }
      })
    )

    // Role readiness comparison — sample up to 50 students for performance
    const TOP_ROLES = [
      'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
      'Data Scientist', 'DevOps Engineer', 'Mobile Developer',
    ]

    const myAllRoles = computeAllRoles(user, mySkills, myProjects, myCerts)
    const myRoleMap  = {}
    myAllRoles.forEach(r => { myRoleMap[r.role] = r.total })

    const sampleStudents = allStudents.slice(0, 50)
    const sampleIds = sampleStudents.map(s => s._id)
    const [sSkills, sProjects, sCerts, sUsers] = await Promise.all([
      Skill.find({ student: { $in: sampleIds } }),
      Project.find({ student: { $in: sampleIds } }),
      Certification.find({ student: { $in: sampleIds } }),
      User.find({ _id: { $in: sampleIds } }),
    ])
    const sSkMap = {}; sSkills.forEach(s => { const id = s.student.toString(); if (!sSkMap[id]) sSkMap[id] = []; sSkMap[id].push(s) })
    const sPrMap = {}; sProjects.forEach(p => { const id = p.student.toString(); if (!sPrMap[id]) sPrMap[id] = []; sPrMap[id].push(p) })
    const sCrMap = {}; sCerts.forEach(c => { const id = c.student.toString(); if (!sCrMap[id]) sCrMap[id] = []; sCrMap[id].push(c) })
    const sUMap  = {}; sUsers.forEach(u => { sUMap[u._id.toString()] = u })

    const roleComparison = TOP_ROLES.map(role => {
      const scores = sampleStudents.map(s => {
        const id = s._id.toString()
        return computeReadiness(sUMap[id] || s, sSkMap[id] || [], sPrMap[id] || [], sCrMap[id] || [], role).total
      })
      const platformAvg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      return { role, yourScore: myRoleMap[role] || 0, platformAvg }
    })

    // Percentile based on best readiness score
    const myBest = myAllRoles[0]?.total || 0
    const platformBests = sampleStudents.map(s => {
      const id = s._id.toString()
      const r  = computeAllRoles(sUMap[id] || s, sSkMap[id] || [], sPrMap[id] || [], sCrMap[id] || [])
      return r[0]?.total || 0
    })
    const percentile = platformBests.length
      ? Math.round((platformBests.filter(sc => sc < myBest).length / platformBests.length) * 100)
      : 0

    res.json({
      you: {
        skillCount:   mySkills.length,
        projectCount: myProjects.length,
        certCount:    myCerts.length,
        cgpa:         user.cgpa || null,
        bestScore:    myBest,
      },
      platform: {
        totalStudents,
        avgSkills:   parseFloat(avgSkills.toFixed(1)),
        avgProjects: parseFloat(avgProjects.toFixed(1)),
        avgCerts:    parseFloat(avgCerts.toFixed(1)),
        avgCgpa:     parseFloat(avgCgpa.toFixed(2)),
      },
      skillComparison: skillComparison.sort((a, b) =>
        Math.abs(b.yourLevel - b.platformAvg) - Math.abs(a.yourLevel - a.platformAvg)
      ),
      roleComparison,
      percentile,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = {
  getProfile, updateProfile,
  getSkills, addSkill, deleteSkill,
  getProjects, addProject, updateProject, deleteProject,
  getCertifications, addCertification, deleteCertification,
  getDashboard, getRecommendations, getSkillGap,
  getReadiness, getActionPlan,
  getResume, getCompare,
}