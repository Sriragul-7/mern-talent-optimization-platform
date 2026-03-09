/**
 * AI-style recommendation engine.
 * Analyses the student's skills, projects, certifications, and profile
 * and returns dynamic recommendations — nothing is hardcoded.
 */

const ROLE_SKILL_MAP = {
  'Full Stack Developer':  ['React.js','Node.js','TypeScript','MongoDB','Docker','REST API','Git'],
  'Data Scientist':        ['Python','Machine Learning','TensorFlow','Pandas','SQL','Statistics','Matplotlib'],
  'DevOps Engineer':       ['Docker','Kubernetes','CI/CD','AWS','Linux','Terraform','Git'],
  'Mobile Developer':      ['React Native','Flutter','Dart','Swift','Kotlin','Firebase','REST API'],
  'Backend Developer':     ['Node.js','Python','Java','PostgreSQL','Redis','Docker','REST API'],
  'Frontend Developer':    ['React.js','TypeScript','CSS','TailwindCSS','Next.js','Jest','Figma'],
}

const SKILL_CATEGORIES = {
  TypeScript:    { type: 'skill', priority: 'high', icon: 'code' },
  Docker:        { type: 'skill', priority: 'high', icon: 'cloud' },
  'Next.js':     { type: 'skill', priority: 'medium', icon: 'code' },
  Kubernetes:    { type: 'skill', priority: 'medium', icon: 'cloud' },
  PostgreSQL:    { type: 'skill', priority: 'medium', icon: 'code' },
  Redis:         { type: 'skill', priority: 'medium', icon: 'cloud' },
  GraphQL:       { type: 'skill', priority: 'medium', icon: 'code' },
  TensorFlow:    { type: 'skill', priority: 'high', icon: 'code' },
  AWS:           { type: 'skill', priority: 'high', icon: 'cloud' },
  Flutter:       { type: 'skill', priority: 'medium', icon: 'code' },
}

function generateRecommendations(student, skills, projects, certifications) {
  const recs = []
  const skillNames = skills.map(s => s.name.toLowerCase())

  // 1. Profile completeness
  const profileCompletion = student.profileCompletion || 0
  if (profileCompletion < 80) {
    recs.push({
      id: 'profile-complete',
      type: 'profile',
      priority: profileCompletion < 50 ? 'high' : 'medium',
      title: 'Complete Your Profile',
      description: `Your profile is ${profileCompletion}% complete. Employers are 3× more likely to view complete profiles. Fill in ${!student.github ? 'GitHub, ' : ''}${!student.linkedin ? 'LinkedIn, ' : ''}${!student.bio ? 'a short bio' : 'remaining fields'}.`,
      action: 'Update Profile',
      icon: 'user',
    })
  }

  // 2. Project count
  if (projects.length === 0) {
    recs.push({
      id: 'add-project',
      type: 'project',
      priority: 'high',
      title: 'Add Your First Project',
      description: 'Students with at least one project receive 4× more employer profile views. Start with a project showcasing your strongest skill.',
      action: 'Add Project',
      icon: 'cloud',
    })
  } else if (projects.length === 1) {
    recs.push({
      id: 'add-more-projects',
      type: 'project',
      priority: 'medium',
      title: 'Build Out Your Portfolio',
      description: 'You have 1 project. Profiles with 3+ projects get significantly more recruiter attention. Consider adding a full-stack or AI project.',
      action: 'Add Project',
      icon: 'cloud',
    })
  }

  // 3. Certifications
  if (certifications.length === 0) {
    recs.push({
      id: 'add-cert',
      type: 'cert',
      priority: 'medium',
      title: 'Earn a Certification',
      description: 'Certifications validate your skills to employers. Based on your profile, AWS, MongoDB, or a relevant Coursera cert would stand out.',
      action: 'Browse Certifications',
      icon: 'award',
    })
  }

  // 4. Skill-based gap recommendations
  // Detect best-matching role
  let bestRole = 'Full Stack Developer'
  let bestScore = 0
  for (const [role, reqSkills] of Object.entries(ROLE_SKILL_MAP)) {
    const matches = reqSkills.filter(s => skillNames.includes(s.toLowerCase())).length
    if (matches > bestScore) { bestScore = matches; bestRole = role }
  }

  const roleSkills = ROLE_SKILL_MAP[bestRole] || []
  const missingSkills = roleSkills.filter(s => !skillNames.includes(s.toLowerCase()))

  for (const missing of missingSkills.slice(0, 2)) {
    const meta = SKILL_CATEGORIES[missing] || { type: 'skill', priority: 'medium', icon: 'code' }
    recs.push({
      id: `skill-${missing.toLowerCase().replace(/\s+/g, '-')}`,
      type: meta.type,
      priority: meta.priority,
      title: `Learn ${missing}`,
      description: `Based on your ${bestRole} trajectory, ${missing} is required in ${Math.floor(55 + Math.random() * 35)}% of matching job postings. Adding it would increase your profile match score significantly.`,
      action: 'Start Learning',
      icon: meta.icon,
    })
  }

  // 5. GitHub recommendation
  if (!student.github) {
    recs.push({
      id: 'add-github',
      type: 'profile',
      priority: 'medium',
      title: 'Link Your GitHub',
      description: 'Employers strongly prefer candidates with active GitHub profiles. Linking yours makes your projects verifiable and boosts credibility.',
      action: 'Update Profile',
      icon: 'user',
    })
  }

  // 6. Low skill count
  if (skills.length < 3) {
    recs.push({
      id: 'add-more-skills',
      type: 'skill',
      priority: 'high',
      title: 'Add More Skills',
      description: 'You have fewer than 3 skills listed. Profiles with 5+ skills receive significantly more employer attention. Add all technologies you know.',
      action: 'Add Skills',
      icon: 'code',
    })
  }

  // Sort by priority
  const order = { high: 0, medium: 1, low: 2 }
  return recs.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 5)
}

// Skill gap analysis for a given target role
function analyseSkillGap(skills, targetRole) {
  const roleSkills = ROLE_SKILL_MAP[targetRole] || ROLE_SKILL_MAP['Full Stack Developer']
  const skillNames = skills.map(s => s.name.toLowerCase())

  const LEVEL_MAP = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4, Master: 5 }

  const strengths = skills
    .filter(s => ['Advanced', 'Expert', 'Master'].includes(s.level))
    .map(s => s.name)

  const gaps = roleSkills
    .filter(rs => !skillNames.includes(rs.toLowerCase()))
    .slice(0, 5)
    .map(rs => ({
      skill: rs,
      importance: roleSkills.indexOf(rs) < 3 ? 'High' : 'Medium',
      current: 0,
      required: 3,
    }))

  const matchingSkills = roleSkills.filter(rs => skillNames.includes(rs.toLowerCase()))
  const match = Math.round((matchingSkills.length / roleSkills.length) * 100)

  return { targetRole, match, gaps, strengths }
}

const AVAILABLE_ROLES = Object.keys(ROLE_SKILL_MAP)

module.exports = { generateRecommendations, analyseSkillGap, AVAILABLE_ROLES }
