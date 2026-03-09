/**
 * SkillBridge — Readiness Score Engine v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses the master skill catalogue with predefined weights.
 * Each role has a required skill list with importance tiers.
 * Score changes meaningfully per role based on actual skill overlap + level.
 *
 * Score formula (100 pts):
 *   Skills     40 pts  = Σ (skill_weight/max_weight × level_weight × tier_multiplier)
 *   Projects   20 pts  = count × relevance × completion_bonus
 *   Certs      15 pts  = count × issuer_prestige
 *   Profile    15 pts  = field_completeness
 *   CGPA       10 pts  = normalised
 */

const { SKILL_LOOKUP } = require('./skillCatalogue')

// ─── Role definitions ─────────────────────────────────────────────────────────
// Each role has:
//   core    → must-have skills (tier multiplier 1.5)
//   strong  → important skills (tier multiplier 1.0)
//   bonus   → nice-to-have (tier multiplier 0.5)

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
    bonus:  ['Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'ELK Stack', 'Google Cloud'],
  },
  'Mobile Developer': {
    core:   ['Flutter', 'Dart', 'React Native', 'Firebase'],
    strong: ['REST API', 'Git', 'JavaScript', 'TypeScript'],
    bonus:  ['Swift', 'Kotlin', 'App Store Deployment', 'Expo', 'Push Notifications'],
  },
  'Backend Developer': {
    core:   ['Node.js', 'Python', 'REST API', 'PostgreSQL', 'SQL'],
    strong: ['Docker', 'Redis', 'Java', 'Git', 'System Design'],
    bonus:  ['GraphQL', 'Microservices', 'Apache Kafka', 'Spring Boot', 'Elasticsearch'],
  },
  'Frontend Developer': {
    core:   ['React.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
    strong: ['Next.js', 'TailwindCSS', 'Git', 'Jest', 'Figma'],
    bonus:  ['Redux', 'React Query', 'Storybook', 'Cypress', 'WebGL', 'D3.js'],
  },
  'Android Developer': {
    core:   ['Kotlin', 'Android SDK', 'Jetpack Compose', 'Java'],
    strong: ['Firebase', 'REST API', 'Git', 'SQLite (Mobile)'],
    bonus:  ['Kotlin Multiplatform', 'App Store Deployment', 'CI/CD'],
  },
  'iOS Developer': {
    core:   ['Swift', 'SwiftUI', 'iOS SDK'],
    strong: ['Objective-C', 'Firebase', 'REST API', 'Git'],
    bonus:  ['App Store Deployment', 'Push Notifications', 'CoreData'],
  },
  'ML Engineer': {
    core:   ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Model Deployment'],
    strong: ['MLflow', 'Docker', 'Kubernetes', 'NumPy', 'Pandas'],
    bonus:  ['CUDA', 'Transformers', 'LangChain', 'Weights & Biases', 'Feature Engineering'],
  },
  'Data Engineer': {
    core:   ['Python', 'SQL', 'Apache Spark', 'Apache Kafka', 'PostgreSQL'],
    strong: ['Docker', 'Airflow', 'AWS', 'Data Preprocessing', 'Bash Scripting'],
    bonus:  ['Elasticsearch', 'Terraform', 'Google Cloud', 'DynamoDB', 'Pandas'],
  },
  'UI/UX Designer': {
    core:   ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping'],
    strong: ['Design Systems', 'User Research', 'Accessibility (a11y)', 'Adobe XD'],
    bonus:  ['HTML', 'CSS', 'Motion Design', 'Brand Design', 'Framer Motion'],
  },
  'Cybersecurity Analyst': {
    core:   ['Cybersecurity', 'Linux', 'Networking', 'Ethical Hacking'],
    strong: ['Python', 'Bash Scripting', 'Docker', 'Git'],
    bonus:  ['Security (DevSecOps)', 'AWS', 'ELK Stack'],
  },
}

const TIER_MULTIPLIER = { core: 1.5, strong: 1.0, bonus: 0.5 }
const LEVEL_WEIGHT    = { Beginner: 0.25, Intermediate: 0.55, Advanced: 0.80, Expert: 1.0, Master: 1.0 }
const PREMIUM_ISSUERS = ['amazon', 'google', 'microsoft', 'mongodb', 'aws', 'meta', 'oracle', 'cisco', 'ibm', 'coursera', 'udacity', 'cncf', 'ec-council', 'red hat']

// ─── Main scoring function ────────────────────────────────────────────────────

function computeReadiness(student, skills, projects, certs, role) {
  const req = ROLE_REQUIREMENTS[role] || ROLE_REQUIREMENTS['Full Stack Developer']
  const allRequired = [...req.core, ...req.strong, ...req.bonus]

  // Build a map of student skills for O(1) lookup
  const studentSkillMap = {}
  skills.forEach(s => {
    studentSkillMap[s.name.toLowerCase()] = s
  })

  // ── 1. Skills Score (40 pts) ──────────────────────────────────────────────
  // Maximum possible: sum of all tier contributions at Expert level
  const maxPossible = req.core.length * 1.5 + req.strong.length * 1.0 + req.bonus.length * 0.5

  let rawSkillScore = 0
  const matchedSkills = []
  const missingSkills = []

  const processTier = (tierSkills, tier) => {
    tierSkills.forEach(reqSkill => {
      const found = studentSkillMap[reqSkill.toLowerCase()]
      if (found) {
        const lvlW  = LEVEL_WEIGHT[found.level] || 0.5
        const tierW = TIER_MULTIPLIER[tier]
        rawSkillScore += lvlW * tierW
        matchedSkills.push({ name: found.name, level: found.level, tier })
      } else {
        const catalogueEntry = SKILL_LOOKUP[reqSkill.toLowerCase()] || { weight: 3 }
        const impact = tier === 'core' ? Math.round(catalogueEntry.weight * 3) :
                       tier === 'strong' ? Math.round(catalogueEntry.weight * 2) :
                       Math.round(catalogueEntry.weight)
        missingSkills.push({ skill: reqSkill, tier, importance: tier === 'core' ? 'High' : tier === 'strong' ? 'Medium' : 'Low', impact: Math.min(impact, 15) })
      }
    })
  }

  processTier(req.core, 'core')
  processTier(req.strong, 'strong')
  processTier(req.bonus, 'bonus')

  const skillScore = maxPossible > 0 ? Math.min(40, Math.round((rawSkillScore / maxPossible) * 40)) : 0

  // ── 2. Projects Score (20 pts) ────────────────────────────────────────────
  const allRequiredLower = allRequired.map(s => s.toLowerCase())
  let projectPts = 0
  projects.forEach(p => {
    const techLower  = (p.tech || []).map(t => t.toLowerCase())
    const relevant   = techLower.filter(t => allRequiredLower.some(r => r.includes(t) || t.includes(r)))
    const relevancePct = relevant.length > 0 ? Math.min(1, relevant.length / 3) : 0.25
    const statusBonus  = p.status === 'Completed' ? 1.0 : p.status === 'In Progress' ? 0.6 : 0.3
    projectPts += 7 * relevancePct * statusBonus
  })
  const projectScore = Math.min(20, Math.round(projectPts))

  // ── 3. Certifications Score (15 pts) ─────────────────────────────────────
  let certPts = 0
  certs.forEach(c => {
    const issuerLower = (c.issuer || '').toLowerCase()
    const isPremium   = PREMIUM_ISSUERS.some(pi => issuerLower.includes(pi))
    certPts += isPremium ? 7 : 4
  })
  const certScore = Math.min(15, Math.round(certPts))

  // ── 4. Profile Score (15 pts) ─────────────────────────────────────────────
  const profileFields = ['name', 'age', 'email', 'cgpa', 'university', 'department', 'github', 'linkedin']
  const filledFields  = profileFields.filter(f => student[f] && String(student[f]).trim())
  const profileScore  = Math.round((filledFields.length / profileFields.length) * 15)

  // ── 5. CGPA Score (10 pts) ────────────────────────────────────────────────
  const cgpa      = parseFloat(student.cgpa) || 0
  const cgpaScore = Math.round(Math.min(10, (cgpa / 10) * 10))

  const total = skillScore + projectScore + certScore + profileScore + cgpaScore

  const grade =
    total >= 85 ? { label: 'Excellent', color: 'emerald' } :
    total >= 70 ? { label: 'Strong',    color: 'brand'   } :
    total >= 55 ? { label: 'Good',      color: 'blue'    } :
    total >= 40 ? { label: 'Fair',      color: 'amber'   } :
                  { label: 'Needs Work',color: 'red'     }

  return {
    total, role,
    breakdown: { skillScore, projectScore, certScore, profileScore, cgpaScore },
    grade,
    matchedSkills,
    missingSkills: missingSkills.sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 }
      return order[a.importance] - order[b.importance]
    }),
  }
}

// ─── Action Plan ─────────────────────────────────────────────────────────────

function generateActionPlan(readiness, student, projects, certs) {
  const steps = []

  // Skill steps — top 3 missing from core/strong tier only
  const criticalGaps = readiness.missingSkills.filter(g => g.tier !== 'bonus').slice(0, 3)
  criticalGaps.forEach((gap, i) => {
    const catalogueEntry = SKILL_LOOKUP[gap.skill.toLowerCase()] || { category: 'Other', weight: 3 }
    steps.push({
      id:          `skill-${i}`,
      week:        i < 2 ? 1 : 2,
      category:    'skill',
      title:       `Learn ${gap.skill}`,
      description: `${gap.skill} is a ${gap.importance.toLowerCase()}-priority ${gap.tier} skill for ${readiness.role}. Adding it at Intermediate level adds +${gap.impact} pts. At Advanced/Expert it adds up to +${Math.round(gap.impact * 1.4)} pts.`,
      impact:      gap.impact,
      effort:      gap.importance === 'High' ? 'High' : 'Medium',
      resources:   getResources(gap.skill),
    })
  })

  // Profile gaps
  const profileGaps = []
  if (!student.github)     profileGaps.push('GitHub')
  if (!student.linkedin)   profileGaps.push('LinkedIn')
  if (!student.cgpa)       profileGaps.push('CGPA')
  if (!student.university) profileGaps.push('University')

  if (profileGaps.length > 0) {
    steps.push({
      id: 'profile', week: 1, category: 'profile',
      title:       'Complete Your Profile',
      description: `Add your ${profileGaps.join(', ')} to gain up to 5 pts in profile score and appear in more employer searches.`,
      impact:      5, effort: 'Low',
      resources:   [{ label: 'Edit Profile →', url: '/student/profile' }],
    })
  }

  // Project gaps
  const completedCount = projects.filter(p => p.status === 'Completed').length
  if (projects.length < 2) {
    steps.push({
      id: 'project', week: 2, category: 'project',
      title:       `Build a ${readiness.role} Project`,
      description: `You have ${projects.length} project(s). Each completed, relevant project adds up to 7 pts. Use the role's core tech stack for maximum impact.`,
      impact:      7, effort: 'High',
      resources:   getProjectIdeas(readiness.role),
    })
  } else if (projects.some(p => p.status !== 'Completed')) {
    steps.push({
      id: 'complete-project', week: 2, category: 'project',
      title:       'Complete an In-Progress Project',
      description: 'Completed projects score 67% higher than in-progress ones. Push one over the finish line for a quick score boost.',
      impact:      4, effort: 'Medium',
      resources:   [{ label: 'My Projects →', url: '/student/projects' }],
    })
  }

  // Cert gaps
  if (certs.length === 0) {
    steps.push({
      id: 'cert', week: 3, category: 'cert',
      title:       `Earn a ${readiness.role} Certification`,
      description: `A premium certification (Google, AWS, MongoDB, etc.) adds 7 pts. A standard cert adds 4 pts. Pick one aligned to your target role.`,
      impact:      7, effort: 'High',
      resources:   getCertResources(readiness.role),
    })
  }

  // Upgrade a skill level
  const intermediateSkills = readiness.matchedSkills.filter(s => s.level === 'Intermediate' && s.tier === 'core')
  if (intermediateSkills.length > 0) {
    const target = intermediateSkills[0]
    steps.push({
      id: 'upgrade-skill', week: 3, category: 'skill',
      title:       `Upgrade ${target.name} to Advanced`,
      description: `You have ${target.name} at Intermediate. Levelling up to Advanced adds ~3 pts to your skill score and signals senior-level readiness to employers.`,
      impact:      3, effort: 'Medium',
      resources:   getResources(target.name),
    })
  }

  return steps
    .sort((a, b) => b.impact - a.impact || a.week - b.week)
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

// ─── All-roles comparison ─────────────────────────────────────────────────────

function computeAllRoles(student, skills, projects, certs) {
  return Object.keys(ROLE_REQUIREMENTS)
    .map(role => {
      const r = computeReadiness(student, skills, projects, certs, role)
      return { role, total: r.total, grade: r.grade }
    })
    .sort((a, b) => b.total - a.total)
}

// ─── Resource helpers ─────────────────────────────────────────────────────────

function getResources(skill) {
  const map = {
    'TypeScript':         [{ label: 'Official Docs', url: 'https://www.typescriptlang.org/docs/' }],
    'Docker':             [{ label: 'Docker Get Started', url: 'https://docs.docker.com/get-started/' }],
    'Kubernetes':         [{ label: 'K8s Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' }],
    'AWS':                [{ label: 'AWS Skill Builder', url: 'https://skillbuilder.aws/' }],
    'React.js':           [{ label: 'React Docs', url: 'https://react.dev/' }],
    'Next.js':            [{ label: 'Next.js Docs', url: 'https://nextjs.org/docs' }],
    'Python':             [{ label: 'Python Tutorial', url: 'https://docs.python.org/3/tutorial/' }],
    'Machine Learning':   [{ label: 'ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' }],
    'TensorFlow':         [{ label: 'TF Tutorials', url: 'https://www.tensorflow.org/tutorials' }],
    'PyTorch':            [{ label: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/' }],
    'Flutter':            [{ label: 'Flutter Docs', url: 'https://docs.flutter.dev/' }],
    'Kotlin':             [{ label: 'Kotlin Docs', url: 'https://kotlinlang.org/docs/' }],
    'Swift':              [{ label: 'Swift Docs', url: 'https://swift.org/documentation/' }],
    'PostgreSQL':         [{ label: 'PostgreSQL Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html' }],
    'Node.js':            [{ label: 'Node.js Docs', url: 'https://nodejs.org/docs/' }],
    'Terraform':          [{ label: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform/docs' }],
    'Redis':              [{ label: 'Redis University', url: 'https://university.redis.com/' }],
    'GraphQL':            [{ label: 'GraphQL Docs', url: 'https://graphql.org/learn/' }],
    'System Design':      [{ label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }],
    'Data Structures':    [{ label: 'NeetCode', url: 'https://neetcode.io/' }],
    'Algorithms':         [{ label: 'LeetCode', url: 'https://leetcode.com/' }],
    'Figma':              [{ label: 'Figma Learn', url: 'https://www.figma.com/resources/learn-design/' }],
    'Transformers':       [{ label: 'Hugging Face Course', url: 'https://huggingface.co/course' }],
    'LangChain':          [{ label: 'LangChain Docs', url: 'https://python.langchain.com/' }],
  }
  return map[skill] || [{ label: `Learn ${skill}`, url: `https://roadmap.sh` }]
}

function getProjectIdeas(role) {
  const map = {
    'Full Stack Developer': [{ label: 'Full Stack Open Course', url: 'https://fullstackopen.com/en/' }],
    'Data Scientist':       [{ label: 'Kaggle Competitions', url: 'https://www.kaggle.com/competitions' }],
    'DevOps Engineer':      [{ label: 'Deploy App on AWS', url: 'https://aws.amazon.com/getting-started/' }],
    'Mobile Developer':     [{ label: 'Flutter Codelabs', url: 'https://docs.flutter.dev/codelabs' }],
    'Frontend Developer':   [{ label: 'Frontend Mentor', url: 'https://www.frontendmentor.io/challenges' }],
    'Backend Developer':    [{ label: 'Backend Project Ideas', url: 'https://github.com/practical-tutorials/project-based-learning' }],
    'ML Engineer':          [{ label: 'Papers with Code', url: 'https://paperswithcode.com/' }],
    'Data Engineer':        [{ label: 'Data Engineering Zoomcamp', url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp' }],
    'UI/UX Designer':       [{ label: 'Figma Community', url: 'https://www.figma.com/community' }],
  }
  return map[role] || [{ label: 'Project Ideas', url: 'https://github.com/practical-tutorials/project-based-learning' }]
}

function getCertResources(role) {
  const map = {
    'Full Stack Developer': [{ label: 'MongoDB Developer Cert', url: 'https://learn.mongodb.com/pages/mongodb-developer-certification' }],
    'Data Scientist':       [{ label: 'Google Data Analytics', url: 'https://grow.google/certificates/data-analytics/' }],
    'DevOps Engineer':      [{ label: 'CKA Certification', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' }],
    'Mobile Developer':     [{ label: 'Google Android Developer', url: 'https://developers.google.com/certification/associate-android-developer' }],
    'Frontend Developer':   [{ label: 'Meta Front-End Dev Cert', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' }],
    'Backend Developer':    [{ label: 'AWS Developer Cert', url: 'https://aws.amazon.com/certification/certified-developer-associate/' }],
    'ML Engineer':          [{ label: 'AWS ML Specialty', url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/' }],
    'Data Engineer':        [{ label: 'Google Professional Data Engineer', url: 'https://cloud.google.com/certification/data-engineer' }],
    'UI/UX Designer':       [{ label: 'Google UX Design Cert', url: 'https://grow.google/certificates/ux-design/' }],
  }
  return map[role] || [{ label: 'Browse Certifications', url: 'https://www.coursera.org/professional-certificates' }]
}

const AVAILABLE_ROLES = Object.keys(ROLE_REQUIREMENTS)

module.exports = { computeReadiness, generateActionPlan, computeAllRoles, ROLE_REQUIREMENTS, AVAILABLE_ROLES }
