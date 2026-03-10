/**
 * SkillBridge — Readiness Score Engine v2 (Fixed)
 *
 * FIXES:
 * - Projects with ZERO matching tech for the target role now score 0 (not 0.25 fallback)
 * - Skill score is strictly based on matched skills only
 * - Profile + CGPA still count (they are role-agnostic, by design)
 *
 * Score breakdown (100 pts total):
 *   Skills  40 pts  — Only skills that match role requirements count
 *   Projects 20 pts — Only projects with tech matching the role count
 *   Certs   15 pts  — Premium issuer: 7pts, standard: 4pts
 *   Profile 15 pts  — 8 fields completeness
 *   CGPA    10 pts  — linear normalisation
 */

const { SKILL_LOOKUP } = require('./skillCatalogue')

// ── Role requirements ─────────────────────────────────────────────────────────
// core   → must-have (multiplier 1.5)
// strong → important (multiplier 1.0)
// bonus  → nice-to-have (multiplier 0.5)

const ROLE_REQUIREMENTS = {
  'Full Stack Developer': {
    core:   ['React.js', 'Node.js', 'TypeScript', 'REST API', 'MongoDB'],
    strong: ['Next.js', 'Express.js', 'PostgreSQL', 'Docker', 'Git', 'JavaScript'],
    bonus:  ['Redis', 'GraphQL', 'AWS', 'TailwindCSS', 'Jest', 'CI/CD'],
  },
  'Data Scientist': {
    core:   ['Python', 'Machine Learning', 'Pandas', 'Statistics', 'NumPy'],
    strong: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Feature Engineering'],
    bonus:  ['Deep Learning', 'NLP', 'Computer Vision', 'Tableau', 'Matplotlib', 'MLflow'],
  },
  'DevOps Engineer': {
    core:   ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
    strong: ['Terraform', 'Ansible', 'Git', 'Bash Scripting', 'GitHub Actions'],
    bonus:  ['Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'Google Cloud'],
  },
  'Mobile Developer': {
    core:   ['Flutter', 'Dart', 'React Native'],
    strong: ['Firebase', 'REST API', 'Git', 'JavaScript'],
    bonus:  ['Swift', 'Kotlin', 'App Store Deployment', 'Expo'],
  },
  'Backend Developer': {
    core:   ['Node.js', 'Python', 'REST API', 'PostgreSQL', 'SQL'],
    strong: ['Docker', 'Redis', 'Java', 'Git', 'System Design'],
    bonus:  ['GraphQL', 'Microservices', 'Apache Kafka', 'Spring Boot', 'Elasticsearch'],
  },
  'Frontend Developer': {
    core:   ['React.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
    strong: ['Next.js', 'TailwindCSS', 'Git', 'Jest', 'Figma'],
    bonus:  ['Redux', 'React Query', 'Storybook', 'Cypress', 'D3.js'],
  },
  'ML Engineer': {
    core:   ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Model Deployment'],
    strong: ['MLflow', 'Docker', 'Kubernetes', 'NumPy', 'Pandas'],
    bonus:  ['Transformers', 'LangChain', 'Hugging Face', 'Feature Engineering'],
  },
  'Data Engineer': {
    core:   ['Python', 'SQL', 'Apache Spark', 'Apache Kafka', 'PostgreSQL'],
    strong: ['Docker', 'AWS', 'Database Design', 'Bash Scripting'],
    bonus:  ['Elasticsearch', 'Terraform', 'Google Cloud', 'Pandas'],
  },
  'UI/UX Designer': {
    core:   ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping'],
    strong: ['Design Systems', 'User Research', 'Accessibility (a11y)', 'Adobe XD'],
    bonus:  ['HTML', 'CSS', 'Framer Motion'],
  },
  'Android Developer': {
    core:   ['Kotlin', 'Android SDK', 'Jetpack Compose'],
    strong: ['Java', 'Firebase', 'REST API', 'Git'],
    bonus:  ['App Store Deployment', 'CI/CD', 'SQLite'],
  },
  'iOS Developer': {
    core:   ['Swift', 'SwiftUI', 'iOS SDK'],
    strong: ['Firebase', 'REST API', 'Git'],
    bonus:  ['App Store Deployment', 'CoreData'],
  },
  'Cybersecurity Analyst': {
    core:   ['Cybersecurity', 'Linux', 'Ethical Hacking'],
    strong: ['Python', 'Bash Scripting', 'Docker', 'Git'],
    bonus:  ['Security (DevSecOps)', 'AWS'],
  },
}

const TIER_MULT    = { core: 1.5, strong: 1.0, bonus: 0.5 }
const LEVEL_WEIGHT = { Beginner: 0.25, Intermediate: 0.55, Advanced: 0.80, Expert: 1.0, Master: 1.0 }
const PREMIUM_ISSUERS = [
  'amazon', 'google', 'microsoft', 'mongodb', 'aws', 'meta', 'oracle',
  'cisco', 'ibm', 'coursera', 'udacity', 'cncf', 'ec-council', 'red hat', 'linux foundation',
]

// ── Main function ─────────────────────────────────────────────────────────────

function computeReadiness(student, skills, projects, certs, role) {
  const req = ROLE_REQUIREMENTS[role] || ROLE_REQUIREMENTS['Full Stack Developer']

  // Normalised student skill map: lowercase name → skill doc
  const studentMap = {}
  skills.forEach(s => { studentMap[s.name.toLowerCase()] = s })

  // ── 1. Skills (40 pts) ────────────────────────────────────────────────────
  // maxPossible: all skills at Expert level
  const maxPossible = req.core.length * 1.5 + req.strong.length * 1.0 + req.bonus.length * 0.5
  let rawScore = 0
  const matchedSkills = []
  const missingSkills = []

  const processTier = (list, tier) => {
    list.forEach(reqSkill => {
      const found = studentMap[reqSkill.toLowerCase()]
      if (found) {
        const lw = LEVEL_WEIGHT[found.level] || 0.5
        rawScore += lw * TIER_MULT[tier]
        matchedSkills.push({ name: found.name, level: found.level, tier })
      } else {
        const entry  = SKILL_LOOKUP[reqSkill.toLowerCase()] || { weight: 3 }
        const impact = Math.min(15,
          tier === 'core'   ? Math.round(entry.weight * 3) :
          tier === 'strong' ? Math.round(entry.weight * 2) :
                              Math.round(entry.weight)
        )
        missingSkills.push({
          skill: reqSkill, tier,
          importance: tier === 'core' ? 'High' : tier === 'strong' ? 'Medium' : 'Low',
          impact,
        })
      }
    })
  }

  processTier(req.core,   'core')
  processTier(req.strong, 'strong')
  processTier(req.bonus,  'bonus')

  const skillScore = maxPossible > 0
    ? Math.min(40, Math.round((rawScore / maxPossible) * 40))
    : 0

  // ── 2. Projects (20 pts) ──────────────────────────────────────────────────
  // IMPORTANT: A project must have AT LEAST ONE tech that matches the role.
  // Projects with no relevant tech contribute 0 pts (not a partial fallback).
  const allReqLower = [...req.core, ...req.strong, ...req.bonus].map(s => s.toLowerCase())

  let projectPts = 0
  projects.forEach(p => {
    const techLower = (p.tech || []).map(t => t.toLowerCase())

    // Count how many of the project's techs match role requirements
    const matchCount = techLower.filter(t =>
      allReqLower.some(r => r === t || r.includes(t) || t.includes(r))
    ).length

    // Zero matching techs → 0 contribution
    if (matchCount === 0) return

    const relevancePct = Math.min(1, matchCount / 3)  // cap at 3 relevant techs
    const statusMult   = p.status === 'Completed' ? 1.0 : p.status === 'In Progress' ? 0.6 : 0.3
    projectPts += 7 * relevancePct * statusMult
  })
  const projectScore = Math.min(20, Math.round(projectPts))

  // ── 3. Certifications (15 pts) ────────────────────────────────────────────
  let certPts = 0
  certs.forEach(c => {
    const isPremium = PREMIUM_ISSUERS.some(pi => (c.issuer || '').toLowerCase().includes(pi))
    certPts += isPremium ? 7 : 4
  })
  const certScore = Math.min(15, Math.round(certPts))

  // ── 4. Profile (15 pts) ───────────────────────────────────────────────────
  // Role-agnostic: a complete profile helps for any role
  const profileFields = ['name', 'age', 'email', 'cgpa', 'university', 'department', 'github', 'linkedin']
  const filled = profileFields.filter(f => student[f] && String(student[f]).trim()).length
  const profileScore = Math.round((filled / profileFields.length) * 15)

  // ── 5. CGPA (10 pts) ──────────────────────────────────────────────────────
  const cgpaScore = Math.round(Math.min(10, ((parseFloat(student.cgpa) || 0) / 10) * 10))

  const total = skillScore + projectScore + certScore + profileScore + cgpaScore

  const grade =
    total >= 85 ? { label: 'Excellent', color: 'emerald' } :
    total >= 70 ? { label: 'Strong',    color: 'brand'   } :
    total >= 55 ? { label: 'Good',      color: 'blue'    } :
    total >= 40 ? { label: 'Fair',      color: 'amber'   } :
                  { label: 'Needs Work',color: 'red'     }

  return {
    total, role, grade,
    breakdown: { skillScore, projectScore, certScore, profileScore, cgpaScore },
    matchedSkills,
    missingSkills: missingSkills.sort((a, b) => {
      const o = { High: 0, Medium: 1, Low: 2 }
      return o[a.importance] - o[b.importance]
    }),
  }
}

// ── Compute all roles ─────────────────────────────────────────────────────────

function computeAllRoles(student, skills, projects, certs) {
  return Object.keys(ROLE_REQUIREMENTS)
    .map(role => {
      const r = computeReadiness(student, skills, projects, certs, role)
      return { role, total: r.total, grade: r.grade }
    })
    .sort((a, b) => b.total - a.total)
}

// ── Action plan ───────────────────────────────────────────────────────────────

function generateActionPlan(readiness, student, projects, certs) {
  const steps = []

  // Top 3 missing core/strong skills
  readiness.missingSkills
    .filter(g => g.tier !== 'bonus')
    .slice(0, 3)
    .forEach((gap, i) => {
      steps.push({
        id: `skill-${i}`,
        week: i < 2 ? 1 : 2,
        category: 'skill',
        title: `Learn ${gap.skill}`,
        description: `${gap.skill} is a ${gap.importance.toLowerCase()}-priority skill for ${readiness.role}. Adding it at Intermediate adds +${gap.impact} pts; Advanced/Expert adds up to +${Math.round(gap.impact * 1.6)} pts.`,
        impact: gap.impact,
        effort: gap.importance === 'High' ? 'High' : 'Medium',
        resources: getResources(gap.skill),
      })
    })

  // Profile completeness
  const missing = []
  if (!student.github)     missing.push('GitHub')
  if (!student.linkedin)   missing.push('LinkedIn')
  if (!student.cgpa)       missing.push('CGPA')
  if (!student.university) missing.push('University')
  if (missing.length) {
    steps.push({
      id: 'profile', week: 1, category: 'profile',
      title: 'Complete Your Profile',
      description: `Add ${missing.join(', ')} to gain +${Math.round((missing.length / 8) * 15)} pts in profile score and appear in more employer searches.`,
      impact: Math.round((missing.length / 8) * 15),
      effort: 'Low',
      resources: [{ label: 'Edit Profile', url: '/student/profile' }],
    })
  }

  // Projects
  const req = ROLE_REQUIREMENTS[readiness.role] || ROLE_REQUIREMENTS['Full Stack Developer']
  const allReqLower = [...req.core, ...req.strong, ...req.bonus].map(s => s.toLowerCase())
  const relevantProjects = projects.filter(p =>
    (p.tech || []).some(t => allReqLower.some(r => r.includes(t.toLowerCase()) || t.toLowerCase().includes(r)))
  )

  if (relevantProjects.length < 2) {
    steps.push({
      id: 'project', week: 2, category: 'project',
      title: `Build a ${readiness.role} Project`,
      description: `You have ${relevantProjects.length} relevant project(s) for this role. Each completed relevant project adds up to 7 pts. Use ${req.core.slice(0, 3).join(', ')} in your project for maximum impact.`,
      impact: 7,
      effort: 'High',
      resources: getProjectIdeas(readiness.role),
    })
  }

  // Certification
  if (certs.length === 0) {
    steps.push({
      id: 'cert', week: 3, category: 'cert',
      title: `Earn a ${readiness.role} Certification`,
      description: 'A premium cert (Google/AWS/Microsoft) adds 7 pts. A standard cert adds 4 pts.',
      impact: 7,
      effort: 'High',
      resources: getCertResources(readiness.role),
    })
  }

  // Upgrade an existing intermediate core skill
  const upgradeTarget = readiness.matchedSkills.find(s => s.level === 'Intermediate' && s.tier === 'core')
  if (upgradeTarget) {
    steps.push({
      id: 'upgrade', week: 3, category: 'skill',
      title: `Upgrade ${upgradeTarget.name} to Advanced`,
      description: `You have ${upgradeTarget.name} at Intermediate. Levelling up to Advanced adds ~3 pts and signals senior-level readiness.`,
      impact: 3,
      effort: 'Medium',
      resources: getResources(upgradeTarget.name),
    })
  }

  return steps
    .sort((a, b) => b.impact - a.impact || a.week - b.week)
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

// ── Resource helpers ──────────────────────────────────────────────────────────

function getResources(skill) {
  const m = {
    'React.js':      [{ label: 'React Docs', url: 'https://react.dev/' }],
    'Next.js':       [{ label: 'Next.js Docs', url: 'https://nextjs.org/docs' }],
    'TypeScript':    [{ label: 'TS Handbook', url: 'https://www.typescriptlang.org/docs/handbook/' }],
    'Node.js':       [{ label: 'Node.js Docs', url: 'https://nodejs.org/docs/' }],
    'Docker':        [{ label: 'Docker Docs', url: 'https://docs.docker.com/get-started/' }],
    'Kubernetes':    [{ label: 'K8s Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' }],
    'AWS':           [{ label: 'AWS Skill Builder', url: 'https://skillbuilder.aws/' }],
    'Python':        [{ label: 'Python Tutorial', url: 'https://docs.python.org/3/tutorial/' }],
    'Machine Learning': [{ label: 'ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' }],
    'TensorFlow':    [{ label: 'TF Tutorials', url: 'https://www.tensorflow.org/tutorials' }],
    'PyTorch':       [{ label: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/' }],
    'Flutter':       [{ label: 'Flutter Docs', url: 'https://docs.flutter.dev/' }],
    'Kotlin':        [{ label: 'Kotlin Docs', url: 'https://kotlinlang.org/docs/' }],
    'Swift':         [{ label: 'Swift Docs', url: 'https://swift.org/documentation/' }],
    'PostgreSQL':    [{ label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/current/tutorial.html' }],
    'Terraform':     [{ label: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform/docs' }],
    'System Design': [{ label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }],
    'Figma':         [{ label: 'Figma Learn', url: 'https://www.figma.com/resources/learn-design/' }],
  }
  return m[skill] || [{ label: `${skill} on roadmap.sh`, url: 'https://roadmap.sh' }]
}

function getProjectIdeas(role) {
  const m = {
    'Full Stack Developer': [{ label: 'Full Stack Open', url: 'https://fullstackopen.com/en/' }],
    'Data Scientist':       [{ label: 'Kaggle Competitions', url: 'https://www.kaggle.com/competitions' }],
    'DevOps Engineer':      [{ label: 'AWS Getting Started', url: 'https://aws.amazon.com/getting-started/' }],
    'Frontend Developer':   [{ label: 'Frontend Mentor', url: 'https://www.frontendmentor.io/challenges' }],
    'ML Engineer':          [{ label: 'Papers with Code', url: 'https://paperswithcode.com/' }],
  }
  return m[role] || [{ label: 'Project Ideas', url: 'https://github.com/practical-tutorials/project-based-learning' }]
}

function getCertResources(role) {
  const m = {
    'Full Stack Developer': [{ label: 'MongoDB Dev Cert', url: 'https://learn.mongodb.com/pages/mongodb-developer-certification' }],
    'Data Scientist':       [{ label: 'Google Data Analytics', url: 'https://grow.google/certificates/data-analytics/' }],
    'DevOps Engineer':      [{ label: 'CKA Certification', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' }],
    'Frontend Developer':   [{ label: 'Meta Front-End Cert', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' }],
    'Backend Developer':    [{ label: 'AWS Developer Cert', url: 'https://aws.amazon.com/certification/certified-developer-associate/' }],
    'ML Engineer':          [{ label: 'AWS ML Specialty', url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/' }],
  }
  return m[role] || [{ label: 'Browse Certs', url: 'https://www.coursera.org/professional-certificates' }]
}

const AVAILABLE_ROLES = Object.keys(ROLE_REQUIREMENTS)

// Alias for backward compatibility
const ROLE_SKILL_MAP = ROLE_REQUIREMENTS

module.exports = {
  computeReadiness,
  computeAllRoles,
  generateActionPlan,
  ROLE_REQUIREMENTS,
  ROLE_SKILL_MAP,
  AVAILABLE_ROLES,
}
