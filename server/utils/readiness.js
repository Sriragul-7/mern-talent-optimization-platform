/**
 * SkillBridge — Readiness Engine v3
 *
 * WHY THE OLD SCORE WAS UNFAIR (and what changed):
 *
 * Problem 1 — Wrong normalization
 *   Old: maxPossible = every skill at Expert level (16.5 pts)
 *   A student with React+Node+JS+MongoDB+Express all at Intermediate only hit 4.2/16.5 = 25% → 10/40 pts
 *   Fix: normalize against "intermediate developer" baseline (core+strong skills at Intermediate)
 *        Hitting this baseline = 38/40. Being Advanced/Expert pushes to 40/40.
 *
 * Problem 2 — Wrong role definition
 *   Old: TypeScript was CORE for Full Stack. JavaScript was only STRONG.
 *   Reality: JavaScript IS the language. TypeScript is nice-to-have.
 *   Fix: JavaScript → core, TypeScript → strong, Docker/Next.js/PostgreSQL → bonus
 *
 * Problem 3 — Beginner level too harshly penalised
 *   Old: Beginner = 0.25 weight (same as knowing almost nothing)
 *   Fix: Beginner = 0.50 (you genuinely know it, just not deeply yet)
 *
 * Problem 4 — Projects scored too low
 *   Old: max 7pts per project, needed 3 matching techs for full relevance
 *   Fix: max 10pts per project, 2 matching techs = full relevance (more achievable)
 *
 * New weights: Skills 40 · Projects 20 · Certs 15 · Profile 15 · CGPA 10 = 100
 *
 * Result: React+Node+JS+MongoDB+Express+REST at Intermediate + 3 full stack projects = ~65/100
 * Add TypeScript+Git → ~73/100. Add a cert → ~80/100. That's honest and motivating.
 */

// ── Role definitions ──────────────────────────────────────────────────────────
// core   = must-have (multiplier ×1.5)
// strong = expected in interviews (multiplier ×1.0)
// bonus  = differentiator, nice-to-have (multiplier ×0.5)

const ROLE_REQUIREMENTS = {
  'Full Stack Developer': {
    core:   ['React.js', 'Node.js', 'JavaScript', 'MongoDB', 'REST API'],
    strong: ['Express.js', 'TypeScript', 'Git', 'HTML', 'CSS'],
    bonus:  ['Next.js', 'PostgreSQL', 'Docker', 'TailwindCSS', 'GraphQL', 'Redis', 'AWS'],
  },
  'Frontend Developer': {
    core:   ['React.js', 'JavaScript', 'HTML', 'CSS', 'TypeScript'],
    strong: ['Next.js', 'TailwindCSS', 'Git', 'Figma', 'REST API'],
    bonus:  ['Redux', 'React Query', 'Jest', 'Storybook', 'Cypress', 'D3.js'],
  },
  'Backend Developer': {
    core:   ['Node.js', 'JavaScript', 'REST API', 'MongoDB', 'SQL'],
    strong: ['Express.js', 'PostgreSQL', 'TypeScript', 'Docker', 'Git'],
    bonus:  ['Redis', 'GraphQL', 'Microservices', 'Apache Kafka', 'System Design'],
  },
  'Data Scientist': {
    core:   ['Python', 'Pandas', 'Machine Learning', 'Statistics', 'NumPy'],
    strong: ['Scikit-learn', 'SQL', 'Matplotlib', 'Data Visualization', 'Jupyter'],
    bonus:  ['TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Feature Engineering', 'Tableau'],
  },
  'ML Engineer': {
    core:   ['Python', 'TensorFlow', 'Machine Learning', 'NumPy', 'Pandas'],
    strong: ['PyTorch', 'Scikit-learn', 'Docker', 'Git', 'Model Deployment'],
    bonus:  ['MLflow', 'Kubernetes', 'LangChain', 'Hugging Face', 'Feature Engineering'],
  },
  'Data Engineer': {
    core:   ['Python', 'SQL', 'PostgreSQL', 'Apache Spark', 'Data Pipelines'],
    strong: ['Apache Kafka', 'Docker', 'AWS', 'Database Design', 'Git'],
    bonus:  ['Terraform', 'Airflow', 'Elasticsearch', 'Google Cloud', 'Pandas'],
  },
  'DevOps Engineer': {
    core:   ['Docker', 'Linux', 'CI/CD', 'Git', 'AWS'],
    strong: ['Kubernetes', 'Terraform', 'Ansible', 'Bash Scripting', 'GitHub Actions'],
    bonus:  ['Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'Google Cloud'],
  },
  'Mobile Developer': {
    core:   ['Flutter', 'Dart', 'REST API', 'Git', 'Firebase'],
    strong: ['React Native', 'JavaScript', 'State Management', 'App Store Deployment'],
    bonus:  ['Swift', 'Kotlin', 'Expo', 'GraphQL', 'Offline Storage'],
  },
  'Android Developer': {
    core:   ['Kotlin', 'Android SDK', 'Java', 'REST API', 'Git'],
    strong: ['Jetpack Compose', 'Firebase', 'SQL', 'MVVM Architecture'],
    bonus:  ['CI/CD', 'App Store Deployment', 'SQLite', 'Coroutines'],
  },
  'iOS Developer': {
    core:   ['Swift', 'SwiftUI', 'iOS SDK', 'REST API', 'Git'],
    strong: ['Objective-C', 'Firebase', 'CoreData', 'MVVM Architecture'],
    bonus:  ['App Store Deployment', 'CI/CD', 'Combine', 'ARKit'],
  },
  'UI/UX Designer': {
    core:   ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research'],
    strong: ['Design Systems', 'Accessibility (a11y)', 'Adobe XD', 'CSS'],
    bonus:  ['HTML', 'Framer Motion', 'Motion Design', 'Usability Testing'],
  },
  'Cybersecurity Analyst': {
    core:   ['Linux', 'Networking', 'Cybersecurity', 'Python', 'Ethical Hacking'],
    strong: ['Bash Scripting', 'Docker', 'Git', 'Penetration Testing'],
    bonus:  ['AWS', 'Security (DevSecOps)', 'Wireshark', 'Metasploit'],
  },
}

const TIER_MULT = { core: 1.5, strong: 1.0, bonus: 0.5 }

// Beginner raised from 0.25→0.50: knowing something at beginner level is real knowledge
const LEVEL_WEIGHT = { Beginner: 0.50, Intermediate: 0.75, Advanced: 0.90, Expert: 1.0, Master: 1.0 }

const PREMIUM_ISSUERS = [
  'amazon', 'google', 'microsoft', 'mongodb', 'aws', 'meta', 'oracle',
  'cisco', 'ibm', 'coursera', 'udacity', 'cncf', 'ec-council', 'red hat', 'linux foundation',
]

// ── Main scoring function ─────────────────────────────────────────────────────

function computeReadiness(student, skills, projects, certs, role) {
  const req = ROLE_REQUIREMENTS[role] || ROLE_REQUIREMENTS['Full Stack Developer']

  const studentMap = {}
  skills.forEach(s => { studentMap[s.name.toLowerCase()] = s })

  // ── 1. Skills (40 pts) ───────────────────────────────────────────────────
  // Baseline = all core + strong skills at Intermediate level.
  // Reaching the baseline → 38 pts. Advanced/Expert pushes to 40.
  // Bonus skills are extra — they can push you above baseline but aren't required.
  const baselineScore =
    req.core.length   * LEVEL_WEIGHT.Intermediate * TIER_MULT.core   +
    req.strong.length * LEVEL_WEIGHT.Intermediate * TIER_MULT.strong

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
        missingSkills.push({
          skill:      reqSkill,
          tier,
          importance: tier === 'core' ? 'High' : tier === 'strong' ? 'Medium' : 'Low',
        })
      }
    })
  }

  processTier(req.core,   'core')
  processTier(req.strong, 'strong')
  processTier(req.bonus,  'bonus')

  const skillScore = baselineScore > 0
    ? Math.min(40, Math.round((rawScore / baselineScore) * 38))
    : 0

  // ── 2. Projects (20 pts) ─────────────────────────────────────────────────
  // Each project worth up to 10 pts. 2 relevant completed projects = full 20 pts.
  const allReqLower = [...req.core, ...req.strong, ...req.bonus].map(s => s.toLowerCase())

  let projectPts = 0
  projects.forEach(p => {
    const techLower = (p.tech || []).map(t => t.toLowerCase())
    const matchCount = techLower.filter(t =>
      allReqLower.some(r => r === t || r.includes(t) || t.includes(r))
    ).length

    if (matchCount === 0) return

    // 2 matching techs = full relevance (was 3 in old engine)
    const relevancePct = Math.min(1, matchCount / 2)
    const statusMult   = p.status === 'Completed' ? 1.0
                       : p.status === 'In Progress' ? 0.6 : 0.3
    projectPts += 10 * relevancePct * statusMult
  })
  const projectScore = Math.min(20, Math.round(projectPts))

  // ── 3. Certifications (15 pts) ────────────────────────────────────────────
  let certPts = 0
  certs.forEach(c => {
    const isPremium = PREMIUM_ISSUERS.some(pi => (c.issuer || '').toLowerCase().includes(pi))
    certPts += isPremium ? 8 : 5
  })
  const certScore = Math.min(15, Math.round(certPts))

  // ── 4. Profile (15 pts) ───────────────────────────────────────────────────
  const profileFields = ['name', 'age', 'email', 'cgpa', 'university', 'department', 'github', 'linkedin']
  const filled        = profileFields.filter(f => student[f] && String(student[f]).trim()).length
  const profileScore  = Math.round((filled / profileFields.length) * 15)

  // ── 5. CGPA (10 pts) ─────────────────────────────────────────────────────
  const cgpaScore = Math.round(Math.min(10, ((parseFloat(student.cgpa) || 0) / 10) * 10))

  const total = skillScore + projectScore + certScore + profileScore + cgpaScore

  const grade =
    total >= 85 ? { label: 'Excellent',  color: 'emerald' } :
    total >= 72 ? { label: 'Strong',     color: 'brand'   } :
    total >= 58 ? { label: 'Good',       color: 'blue'    } :
    total >= 42 ? { label: 'Fair',       color: 'amber'   } :
                  { label: 'Needs Work', color: 'red'     }

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

// ── All-roles ranking ─────────────────────────────────────────────────────────

function computeAllRoles(student, skills, projects, certs) {
  return Object.keys(ROLE_REQUIREMENTS)
    .map(role => {
      const r = computeReadiness(student, skills, projects, certs, role)
      return { role, total: r.total, grade: r.grade }
    })
    .sort((a, b) => b.total - a.total)
}

// ── Action plan ───────────────────────────────────────────────────────────────
// No score projections. Focused on real next steps with curated course links.

function generateActionPlan(readiness, student, projects, certs) {
  const steps = []
  const req   = ROLE_REQUIREMENTS[readiness.role] || ROLE_REQUIREMENTS['Full Stack Developer']

  // 1. Missing CORE skills — highest priority, up to 3
  readiness.missingSkills
    .filter(g => g.tier === 'core')
    .slice(0, 3)
    .forEach((gap, i) => {
      steps.push({
        id:       `core-${i}`,
        priority: 1,
        category: 'skill',
        type:     'missing-core',
        title:    `Learn ${gap.skill}`,
        why:      `Core skill for ${readiness.role}. Almost every job posting lists this — it's the highest-impact thing you can add.`,
        courses:  getCourses(gap.skill),
      })
    })

  // 2. Upgrade existing Intermediate → Advanced on matched core/strong skills
  readiness.matchedSkills
    .filter(s => s.level === 'Intermediate' && (s.tier === 'core' || s.tier === 'strong'))
    .slice(0, 2)
    .forEach((s, i) => {
      steps.push({
        id:       `upgrade-${i}`,
        priority: 2,
        category: 'skill',
        type:     'upgrade',
        title:    `Deepen ${s.name} to Advanced`,
        why:      `You already know ${s.name}. Going from Intermediate to Advanced is what separates juniors from strong candidates in interviews.`,
        courses:  getCourses(s.name),
      })
    })

  // 3. Missing STRONG skills — secondary, up to 2
  readiness.missingSkills
    .filter(g => g.tier === 'strong')
    .slice(0, 2)
    .forEach((gap, i) => {
      steps.push({
        id:       `strong-${i}`,
        priority: 3,
        category: 'skill',
        type:     'missing-strong',
        title:    `Pick up ${gap.skill}`,
        why:      `Shows up in most ${readiness.role} job descriptions. Not blocking, but adds real credibility to your profile.`,
        courses:  getCourses(gap.skill),
      })
    })

  // 4. Build project if fewer than 2 relevant
  const allReqLower = [...req.core, ...req.strong, ...req.bonus].map(s => s.toLowerCase())
  const relevantProjects = projects.filter(p =>
    (p.tech || []).some(t =>
      allReqLower.some(r => r.includes(t.toLowerCase()) || t.toLowerCase().includes(r))
    )
  )
  if (relevantProjects.length < 2) {
    steps.push({
      id:       'project',
      priority: 4,
      category: 'project',
      type:     'project',
      title:    `Build a ${readiness.role} Project`,
      why:      `You have ${relevantProjects.length} relevant project${relevantProjects.length === 1 ? '' : 's'}. A real portfolio project using ${req.core.slice(0, 3).join(', ')} is the most convincing thing you can show a recruiter.`,
      courses:  getProjectResources(readiness.role),
    })
  }

  // 5. Certification if none earned yet
  if (certs.length === 0) {
    steps.push({
      id:       'cert',
      priority: 5,
      category: 'cert',
      type:     'cert',
      title:    `Earn a Recognised Certification`,
      why:      `A cert from Google, AWS, or Meta adds credibility — especially for campus placements and your first job where work experience is thin.`,
      courses:  getCertCourses(readiness.role),
    })
  }

  // 6. Profile completeness
  const missingFields = []
  if (!student.github)     missingFields.push('GitHub link')
  if (!student.linkedin)   missingFields.push('LinkedIn link')
  if (!student.university) missingFields.push('University')
  if (!student.cgpa)       missingFields.push('CGPA')
  if (missingFields.length) {
    steps.push({
      id:       'profile',
      priority: 6,
      category: 'profile',
      type:     'profile',
      title:    'Complete Your Profile',
      why:      `Missing: ${missingFields.join(', ')}. Employers filter search results by these fields — an incomplete profile means fewer views.`,
      courses:  [{ label: 'Go to Profile Settings', url: '/student/profile', tag: 'Internal' }],
    })
  }

  return steps.sort((a, b) => a.priority - b.priority)
}

// ── Course catalogue ──────────────────────────────────────────────────────────
// 2–3 curated options per skill: one free, one structured, one paid (where relevant).

function getCourses(skill) {
  const map = {
    // ─ Full Stack core ────────────────────────────────────────────────────────
    'JavaScript': [
      { label: 'JavaScript.info — The Modern JS Tutorial',       url: 'https://javascript.info/',                                                                  tag: 'Free'    },
      { label: 'The Odin Project — Full Stack JS',               url: 'https://www.theodinproject.com/paths/full-stack-javascript',                               tag: 'Free'    },
      { label: 'freeCodeCamp JS Algorithms & Data Structures',   url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',            tag: 'Free'    },
    ],
    'React.js': [
      { label: 'React Official Docs — react.dev/learn',          url: 'https://react.dev/learn',                                                                   tag: 'Free'    },
      { label: 'Full Stack Open — React (Helsinki Uni)',         url: 'https://fullstackopen.com/en/part1',                                                        tag: 'Free'    },
      { label: 'React — The Complete Guide (Udemy)',             url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',                        tag: 'Paid'    },
    ],
    'Node.js': [
      { label: 'Node.js Official Docs — Getting Started',        url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',                      tag: 'Free'    },
      { label: 'Full Stack Open — Node.js & Express',           url: 'https://fullstackopen.com/en/part3',                                                        tag: 'Free'    },
      { label: 'The Complete Node.js Developer Course (Udemy)',  url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/',                    tag: 'Paid'    },
    ],
    'MongoDB': [
      { label: 'MongoDB University — Free Courses',              url: 'https://learn.mongodb.com/catalog',                                                        tag: 'Free'    },
      { label: 'Full Stack Open — MongoDB',                     url: 'https://fullstackopen.com/en/part3b',                                                       tag: 'Free'    },
      { label: 'MongoDB Crash Course — Traversy Media',         url: 'https://www.youtube.com/watch?v=-56x56UppqQ',                                              tag: 'Free'    },
    ],
    'REST API': [
      { label: 'RESTful API Design Guide — restfulapi.net',      url: 'https://restfulapi.net/',                                                                  tag: 'Free'    },
      { label: 'Build a REST API with Node & Express',           url: 'https://www.youtube.com/watch?v=l8WPWK9mS5M',                                              tag: 'Free'    },
    ],
    'Express.js': [
      { label: 'Express.js Official Docs',                       url: 'https://expressjs.com/en/starter/installing.html',                                        tag: 'Free'    },
      { label: 'Node & Express — freeCodeCamp 8-hour course',   url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',                                              tag: 'Free'    },
    ],
    // ─ Full Stack strong ──────────────────────────────────────────────────────
    'TypeScript': [
      { label: 'TypeScript Handbook — Official',                 url: 'https://www.typescriptlang.org/docs/handbook/intro.html',                                 tag: 'Free'    },
      { label: 'Full Stack Open — TypeScript',                  url: 'https://fullstackopen.com/en/part9',                                                        tag: 'Free'    },
      { label: 'TypeScript Beginner Guide — freeCodeCamp',      url: 'https://www.freecodecamp.org/news/learn-typescript-beginners-guide/',                     tag: 'Free'    },
    ],
    'Git': [
      { label: 'Learn Git Branching — Interactive & Visual',     url: 'https://learngitbranching.js.org/',                                                       tag: 'Free'    },
      { label: 'Git Official Docs',                             url: 'https://git-scm.com/doc',                                                                  tag: 'Free'    },
      { label: 'Git & GitHub Crash Course — Traversy Media',    url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc',                                             tag: 'Free'    },
    ],
    'HTML': [
      { label: 'MDN HTML Learning Guide',                        url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML',                                     tag: 'Free'    },
      { label: 'freeCodeCamp — Responsive Web Design',          url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',                          tag: 'Free'    },
    ],
    'CSS': [
      { label: 'MDN CSS Learning Guide',                         url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS',                                      tag: 'Free'    },
      { label: 'CSS — The Complete Guide (Udemy)',               url: 'https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/',            tag: 'Paid'    },
      { label: 'Kevin Powell — CSS on YouTube',                 url: 'https://www.youtube.com/@KevinPowell',                                                     tag: 'Free'    },
    ],
    // ─ Full Stack bonus ───────────────────────────────────────────────────────
    'Next.js': [
      { label: 'Next.js Official Tutorial',                      url: 'https://nextjs.org/learn',                                                                 tag: 'Free'    },
      { label: 'Next.js 14 Complete Course (Udemy)',             url: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/',                          tag: 'Paid'    },
    ],
    'PostgreSQL': [
      { label: 'PostgreSQL Tutorial — postgresqltutorial.com',   url: 'https://www.postgresqltutorial.com/',                                                     tag: 'Free'    },
      { label: 'Learn PostgreSQL — freeCodeCamp 4-hour video',  url: 'https://www.youtube.com/watch?v=qw--VYLpxG4',                                             tag: 'Free'    },
    ],
    'Docker': [
      { label: 'Docker Official — Getting Started',              url: 'https://docs.docker.com/get-started/',                                                    tag: 'Free'    },
      { label: 'Docker for Beginners — TechWorld with Nana',    url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',                                             tag: 'Free'    },
      { label: 'Docker & Kubernetes Practical Guide (Udemy)',    url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/',                    tag: 'Paid'    },
    ],
    'TailwindCSS': [
      { label: 'Tailwind CSS Official Docs',                     url: 'https://tailwindcss.com/docs/installation',                                               tag: 'Free'    },
      { label: 'Tailwind CSS Tutorial — Net Ninja',             url: 'https://www.youtube.com/watch?v=bxmDnn7lrnk&list=PL4cUxeGkcC9gpXORlEHjc5bgnIi5HEGhw',  tag: 'Free'    },
    ],
    'GraphQL': [
      { label: 'GraphQL Official Docs',                          url: 'https://graphql.org/learn/',                                                              tag: 'Free'    },
      { label: 'Full Stack Open — GraphQL',                     url: 'https://fullstackopen.com/en/part8',                                                       tag: 'Free'    },
    ],
    'Redis': [
      { label: 'Redis University — Free Courses',                url: 'https://university.redis.com/',                                                           tag: 'Free'    },
    ],
    'AWS': [
      { label: 'AWS Skill Builder — Free Tier',                  url: 'https://skillbuilder.aws/',                                                               tag: 'Free'    },
      { label: 'AWS Cloud Practitioner — freeCodeCamp',         url: 'https://www.youtube.com/watch?v=NhDYbskXRgc',                                             tag: 'Free'    },
      { label: 'AWS Solutions Architect (Udemy)',                url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',      tag: 'Paid'    },
    ],
    // ─ Data / ML ──────────────────────────────────────────────────────────────
    'Python': [
      { label: 'CS50P — Harvard Python Course (Free)',           url: 'https://cs50.harvard.edu/python/',                                                        tag: 'Free'    },
      { label: 'Automate the Boring Stuff with Python (Free)',   url: 'https://automatetheboringstuff.com/',                                                     tag: 'Free'    },
      { label: 'Python Official Tutorial',                      url: 'https://docs.python.org/3/tutorial/',                                                      tag: 'Free'    },
    ],
    'Machine Learning': [
      { label: 'ML Crash Course — Google (Free)',                url: 'https://developers.google.com/machine-learning/crash-course',                            tag: 'Free'    },
      { label: 'Andrew Ng ML Specialization — Coursera',        url: 'https://www.coursera.org/specializations/machine-learning-introduction',                 tag: 'Paid'    },
      { label: 'fast.ai — Practical Deep Learning (Free)',       url: 'https://course.fast.ai/',                                                                 tag: 'Free'    },
    ],
    'Pandas': [
      { label: 'Kaggle Pandas Course (Free, 4 hours)',           url: 'https://www.kaggle.com/learn/pandas',                                                    tag: 'Free'    },
      { label: 'Pandas Official Docs',                          url: 'https://pandas.pydata.org/docs/getting_started/',                                         tag: 'Free'    },
    ],
    'NumPy': [
      { label: 'NumPy Official Quickstart',                      url: 'https://numpy.org/doc/stable/user/quickstart.html',                                      tag: 'Free'    },
      { label: 'Kaggle Intro to ML (includes NumPy)',            url: 'https://www.kaggle.com/learn/intro-to-ml',                                               tag: 'Free'    },
    ],
    'Statistics': [
      { label: 'Khan Academy — Statistics & Probability',        url: 'https://www.khanacademy.org/math/statistics-probability',                                tag: 'Free'    },
      { label: 'StatQuest with Josh Starmer (YouTube)',          url: 'https://www.youtube.com/@statquest',                                                      tag: 'Free'    },
    ],
    'TensorFlow': [
      { label: 'TensorFlow Official Tutorials',                  url: 'https://www.tensorflow.org/tutorials',                                                   tag: 'Free'    },
      { label: 'Deep Learning Specialization — Coursera',        url: 'https://www.coursera.org/specializations/deep-learning',                                tag: 'Paid'    },
    ],
    'PyTorch': [
      { label: 'PyTorch Official Tutorials',                     url: 'https://pytorch.org/tutorials/beginner/basics/intro.html',                              tag: 'Free'    },
      { label: 'fast.ai Deep Learning with PyTorch (Free)',      url: 'https://course.fast.ai/',                                                                tag: 'Free'    },
    ],
    'Scikit-learn': [
      { label: 'Scikit-learn Official User Guide',               url: 'https://scikit-learn.org/stable/user_guide.html',                                       tag: 'Free'    },
      { label: 'Kaggle Intermediate ML (Free)',                  url: 'https://www.kaggle.com/learn/intermediate-machine-learning',                            tag: 'Free'    },
    ],
    'SQL': [
      { label: 'SQLZoo — Interactive SQL Tutorial',              url: 'https://sqlzoo.net/',                                                                    tag: 'Free'    },
      { label: 'Kaggle Intro to SQL (Free)',                     url: 'https://www.kaggle.com/learn/intro-to-sql',                                              tag: 'Free'    },
      { label: 'Mode SQL Tutorial',                             url: 'https://mode.com/sql-tutorial/',                                                          tag: 'Free'    },
    ],
    'Model Deployment': [
      { label: 'Deploy ML Models with FastAPI — freeCodeCamp',   url: 'https://www.youtube.com/watch?v=bjsJOl8gz5k',                                           tag: 'Free'    },
      { label: 'FastAPI Official Tutorial',                     url: 'https://fastapi.tiangolo.com/tutorial/',                                                  tag: 'Free'    },
    ],
    // ─ DevOps ─────────────────────────────────────────────────────────────────
    'Linux': [
      { label: 'Linux Journey — Interactive (Free)',             url: 'https://linuxjourney.com/',                                                               tag: 'Free'    },
      { label: 'The Linux Command Line (Free Book)',             url: 'https://linuxcommand.org/tlcl.php',                                                       tag: 'Free'    },
    ],
    'Kubernetes': [
      { label: 'Kubernetes Official Tutorials',                  url: 'https://kubernetes.io/docs/tutorials/',                                                  tag: 'Free'    },
      { label: 'Kubernetes Full Course — TechWorld with Nana',  url: 'https://www.youtube.com/watch?v=X48VuDVv0do',                                            tag: 'Free'    },
      { label: 'CKA Prep — KodeKloud',                          url: 'https://kodekloud.com/courses/cka-certification-course-certified-kubernetes-administrator/', tag: 'Paid' },
    ],
    'CI/CD': [
      { label: 'GitHub Actions Official Docs',                   url: 'https://docs.github.com/en/actions',                                                     tag: 'Free'    },
      { label: 'CI/CD with GitHub Actions — freeCodeCamp',      url: 'https://www.youtube.com/watch?v=R8_veQiYBjI',                                            tag: 'Free'    },
    ],
    'Terraform': [
      { label: 'HashiCorp Learn — Terraform (Free)',             url: 'https://developer.hashicorp.com/terraform/tutorials',                                    tag: 'Free'    },
    ],
    // ─ Mobile ─────────────────────────────────────────────────────────────────
    'Flutter': [
      { label: 'Flutter Official Codelabs',                      url: 'https://docs.flutter.dev/codelabs',                                                      tag: 'Free'    },
      { label: 'Flutter & Dart Complete Guide (Udemy)',          url: 'https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/',            tag: 'Paid'    },
      { label: 'Flutter Tutorial — Net Ninja (YouTube)',         url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jLYyp2Aoh6hcWuxFDX6PBJ',            tag: 'Free'    },
    ],
    'Dart': [
      { label: 'Dart Official Language Tour',                    url: 'https://dart.dev/language',                                                              tag: 'Free'    },
    ],
    'Kotlin': [
      { label: 'Kotlin Official Docs',                           url: 'https://kotlinlang.org/docs/getting-started.html',                                      tag: 'Free'    },
      { label: 'Android Basics with Compose — Google (Free)',    url: 'https://developer.android.com/courses/android-basics-compose/course',                  tag: 'Free'    },
    ],
    'Swift': [
      { label: 'Swift Official Documentation',                   url: 'https://www.swift.org/documentation/',                                                  tag: 'Free'    },
      { label: 'iOS App Dev Tutorials — Apple (Free)',           url: 'https://developer.apple.com/tutorials/app-dev-training',                                tag: 'Free'    },
      { label: 'iOS & Swift Bootcamp — Udemy',                  url: 'https://www.udemy.com/course/ios-13-app-development-bootcamp/',                         tag: 'Paid'    },
    ],
    'Firebase': [
      { label: 'Firebase Official Docs',                         url: 'https://firebase.google.com/docs',                                                      tag: 'Free'    },
      { label: 'Firebase Tutorial — Net Ninja (YouTube)',        url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jm0-FZR2ByHXcpWMUH3aXI',            tag: 'Free'    },
    ],
    // ─ Design ─────────────────────────────────────────────────────────────────
    'Figma': [
      { label: 'Figma Learn — Official',                         url: 'https://www.figma.com/resources/learn-design/',                                         tag: 'Free'    },
      { label: 'Figma UI Design Tutorial — freeCodeCamp',       url: 'https://www.youtube.com/watch?v=jwCmIBJ8Jtc',                                            tag: 'Free'    },
    ],
    // ─ Security ───────────────────────────────────────────────────────────────
    'Cybersecurity': [
      { label: 'CS50 Cybersecurity — Harvard (Free)',            url: 'https://cs50.harvard.edu/cybersecurity/',                                                tag: 'Free'    },
      { label: 'TryHackMe — Learn by Doing (Free Tier)',        url: 'https://tryhackme.com/',                                                                  tag: 'Free'    },
    ],
    'Ethical Hacking': [
      { label: 'TryHackMe Pre-Security Path (Free)',             url: 'https://tryhackme.com/path/outline/presecurity',                                        tag: 'Free'    },
      { label: 'Ethical Hacking — HackerSploit (YouTube)',       url: 'https://www.youtube.com/playlist?list=PLBf0hzazHTGOEuhPQSnq-Ej8jRyXxfYvl',            tag: 'Free'    },
    ],
    'Linux': [
      { label: 'Linux Journey — Interactive (Free)',             url: 'https://linuxjourney.com/',                                                               tag: 'Free'    },
      { label: 'The Linux Command Line (Free eBook)',            url: 'https://linuxcommand.org/tlcl.php',                                                       tag: 'Free'    },
    ],
    'Networking': [
      { label: 'Computer Networking — Stanford (Coursera)',      url: 'https://www.coursera.org/learn/computer-networking',                                    tag: 'Paid'    },
      { label: 'Network Chuck — Networking on YouTube',         url: 'https://www.youtube.com/@NetworkChuck',                                                   tag: 'Free'    },
    ],
    // ─ General ────────────────────────────────────────────────────────────────
    'System Design': [
      { label: 'System Design Primer — GitHub (Free)',           url: 'https://github.com/donnemartin/system-design-primer',                                   tag: 'Free'    },
      { label: 'Grokking System Design — educative.io',         url: 'https://www.educative.io/courses/grokking-the-system-design-interview',                 tag: 'Paid'    },
    ],
    'Data Visualization': [
      { label: 'Kaggle Data Visualization (Free)',               url: 'https://www.kaggle.com/learn/data-visualization',                                       tag: 'Free'    },
    ],
    'Data Pipelines': [
      { label: 'Data Engineering Zoomcamp (Free)',               url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp',                            tag: 'Free'    },
    ],
    'Apache Spark': [
      { label: 'Databricks Spark Fundamentals (Free)',           url: 'https://www.databricks.com/learn/training/home',                                        tag: 'Free'    },
    ],
    'Apache Kafka': [
      { label: 'Kafka Official Quickstart',                      url: 'https://kafka.apache.org/quickstart',                                                   tag: 'Free'    },
    ],
    'Figma': [
      { label: 'Figma Learn — Official',                         url: 'https://www.figma.com/resources/learn-design/',                                         tag: 'Free'    },
    ],
    'User Research': [
      { label: 'UX Research Fundamentals — Google (Coursera)',   url: 'https://www.coursera.org/learn/foundations-user-experience-design',                    tag: 'Paid'    },
    ],
    'Wireframing': [
      { label: 'Google UX Design Certificate — Coursera',        url: 'https://www.coursera.org/professional-certificates/google-ux-design',                  tag: 'Paid'    },
    ],
    'Prototyping': [
      { label: 'Google UX Design Certificate — Coursera',        url: 'https://www.coursera.org/professional-certificates/google-ux-design',                  tag: 'Paid'    },
    ],
  }

  return map[skill] || [
    { label: `${skill} — roadmap.sh Guide`,    url: 'https://roadmap.sh',            tag: 'Guide' },
    { label: `${skill} — freeCodeCamp Search`, url: 'https://www.freecodecamp.org',  tag: 'Free'  },
  ]
}

// ── Project resources ─────────────────────────────────────────────────────────

function getProjectResources(role) {
  const map = {
    'Full Stack Developer': [
      { label: 'Full Stack Open — Helsinki Uni (best free full stack course)', url: 'https://fullstackopen.com/en/',                                                tag: 'Free'  },
      { label: '10 Full Stack Project Ideas — GeeksforGeeks',                  url: 'https://www.geeksforgeeks.org/full-stack-project-ideas/',                     tag: 'Ideas' },
    ],
    'Frontend Developer': [
      { label: 'Frontend Mentor — Real-world challenges',                       url: 'https://www.frontendmentor.io/challenges',                                    tag: 'Free'  },
      { label: 'JavaScript30 — 30 projects in 30 days',                        url: 'https://javascript30.com/',                                                   tag: 'Free'  },
    ],
    'Backend Developer': [
      { label: 'roadmap.sh — Backend Project Ideas',                            url: 'https://roadmap.sh/backend/projects',                                        tag: 'Ideas' },
      { label: 'Build 5 Node.js REST APIs — freeCodeCamp',                     url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',                                tag: 'Free'  },
    ],
    'Data Scientist': [
      { label: 'Kaggle — Real datasets and competitions',                       url: 'https://www.kaggle.com/competitions',                                        tag: 'Free'  },
      { label: 'Data Science Projects — towardsdatascience',                   url: 'https://towardsdatascience.com/data-science-projects-for-beginners-e1d1fc5fc5b4', tag: 'Ideas' },
    ],
    'ML Engineer': [
      { label: 'Papers with Code — Reproduce ML research',                      url: 'https://paperswithcode.com/',                                                tag: 'Free'  },
      { label: 'Hugging Face Courses (Free)',                                   url: 'https://huggingface.co/learn',                                               tag: 'Free'  },
    ],
    'Data Engineer': [
      { label: 'Data Engineering Zoomcamp (Free)',                               url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp',                tag: 'Free'  },
    ],
    'DevOps Engineer': [
      { label: 'roadmap.sh — DevOps Project Ideas',                             url: 'https://roadmap.sh/devops/projects',                                        tag: 'Ideas' },
      { label: 'KodeKloud DevOps Labs',                                         url: 'https://kodekloud.com/',                                                     tag: 'Paid'  },
    ],
    'Mobile Developer': [
      { label: 'Flutter Codelabs — Google',                                     url: 'https://codelabs.developers.google.com/?cat=flutter',                       tag: 'Free'  },
      { label: 'React Native Tutorial Projects',                                url: 'https://reactnative.dev/docs/tutorial',                                      tag: 'Free'  },
    ],
    'Android Developer': [
      { label: 'Android Basics with Compose — Google',                          url: 'https://developer.android.com/courses/android-basics-compose/course',       tag: 'Free'  },
    ],
    'iOS Developer': [
      { label: 'Apple SwiftUI Tutorials (Free)',                                url: 'https://developer.apple.com/tutorials/swiftui',                              tag: 'Free'  },
    ],
    'UI/UX Designer': [
      { label: 'Figma Community — Free UI Kits & Templates',                   url: 'https://www.figma.com/community',                                            tag: 'Free'  },
    ],
    'Cybersecurity Analyst': [
      { label: 'TryHackMe Learning Paths (Free)',                               url: 'https://tryhackme.com/paths',                                                tag: 'Free'  },
      { label: 'HackTheBox — Practice Labs',                                   url: 'https://www.hackthebox.com/',                                                tag: 'Free'  },
    ],
  }
  return map[role] || [
    { label: 'Project-Based Learning — GitHub', url: 'https://github.com/practical-tutorials/project-based-learning', tag: 'Free' },
  ]
}

// ── Certification resources ───────────────────────────────────────────────────

function getCertCourses(role) {
  const map = {
    'Full Stack Developer': [
      { label: 'MongoDB Developer Certification (Free exam prep)',               url: 'https://learn.mongodb.com/pages/mongodb-developer-certification',           tag: 'Free'  },
      { label: 'Meta Full-Stack Developer — Coursera',                          url: 'https://www.coursera.org/professional-certificates/meta-back-end-developer', tag: 'Paid' },
    ],
    'Frontend Developer': [
      { label: 'Meta Front-End Developer Certificate — Coursera',               url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', tag: 'Paid' },
      { label: 'freeCodeCamp — Responsive Web Design Certification',            url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',            tag: 'Free'  },
    ],
    'Backend Developer': [
      { label: 'AWS Developer Associate Certification',                          url: 'https://aws.amazon.com/certification/certified-developer-associate/',       tag: 'Paid'  },
      { label: 'Meta Back-End Developer — Coursera',                            url: 'https://www.coursera.org/professional-certificates/meta-back-end-developer', tag: 'Paid' },
    ],
    'Data Scientist': [
      { label: 'Google Data Analytics Certificate — Coursera',                  url: 'https://www.coursera.org/professional-certificates/google-data-analytics',  tag: 'Paid'  },
      { label: 'IBM Data Science Professional Certificate',                     url: 'https://www.coursera.org/professional-certificates/ibm-data-science',       tag: 'Paid'  },
    ],
    'ML Engineer': [
      { label: 'TensorFlow Developer Certificate — Google',                     url: 'https://www.tensorflow.org/certificate',                                    tag: 'Paid'  },
      { label: 'AWS Machine Learning Specialty',                                url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/', tag: 'Paid' },
    ],
    'Data Engineer': [
      { label: 'Google Professional Data Engineer Certification',               url: 'https://cloud.google.com/learn/certification/data-engineer',                tag: 'Paid'  },
    ],
    'DevOps Engineer': [
      { label: 'CKA — Certified Kubernetes Administrator',                      url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/', tag: 'Paid' },
      { label: 'AWS Solutions Architect Associate',                             url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', tag: 'Paid' },
    ],
    'Mobile Developer': [
      { label: 'Google Associate Android Developer',                            url: 'https://developers.google.com/certification/associate-android-developer',   tag: 'Paid'  },
    ],
    'Android Developer': [
      { label: 'Google Associate Android Developer',                            url: 'https://developers.google.com/certification/associate-android-developer',   tag: 'Paid'  },
    ],
    'iOS Developer': [
      { label: 'Apple Developer Program',                                       url: 'https://developer.apple.com/programs/',                                     tag: 'Paid'  },
    ],
    'UI/UX Designer': [
      { label: 'Google UX Design Professional Certificate — Coursera',          url: 'https://www.coursera.org/professional-certificates/google-ux-design',       tag: 'Paid'  },
    ],
    'Cybersecurity Analyst': [
      { label: 'CompTIA Security+ Certification',                               url: 'https://www.comptia.org/certifications/security',                           tag: 'Paid'  },
      { label: 'CEH — EC-Council Certified Ethical Hacker',                    url: 'https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/',     tag: 'Paid'  },
    ],
  }
  return map[role] || [
    { label: 'Browse Professional Certs — Coursera', url: 'https://www.coursera.org/professional-certificates', tag: 'Paid' },
  ]
}

// ── Exports ───────────────────────────────────────────────────────────────────

const AVAILABLE_ROLES = Object.keys(ROLE_REQUIREMENTS)
const ROLE_SKILL_MAP  = ROLE_REQUIREMENTS // backward compat

module.exports = {
  computeReadiness,
  computeAllRoles,
  generateActionPlan,
  ROLE_REQUIREMENTS,
  ROLE_SKILL_MAP,
  AVAILABLE_ROLES,
}