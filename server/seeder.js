/**
 * SkillBridge — Rich Demo Seeder
 * Run: node seeder.js
 * 
 * Creates:
 *   • 1 admin account
 *   • 5 employer accounts (approved)
 *   • 50 student accounts across 10 universities, 6 departments
 *     Each student gets 3–10 skills, 1–4 projects, 0–2 certifications
 * 
 * Default passwords: Admin123! / Employer123! / Student123!
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const User          = require('./models/User')
const Skill         = require('./models/Skill')
const Project       = require('./models/Project')
const Certification = require('./models/Certification')

// ── Config ────────────────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillbridge'

// ── Reference data ─────────────────────────────────────────────────────────

const UNIVERSITIES = [
  'IIT Madras',
  'NIT Trichy',
  'Anna University',
  'VIT Vellore',
  'PSG College of Technology',
  'SSN College of Engineering',
  'Coimbatore Institute of Technology',
  'Thiagarajar College of Engineering',
  'Kongu Engineering College',
  'SASTRA University',
]

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Data Science',
]

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

// Skills grouped by role focus
const SKILL_POOLS = {
  fullstack: [
    { name: 'React.js',    category: 'Frontend' },
    { name: 'Node.js',     category: 'Backend'  },
    { name: 'TypeScript',  category: 'Language' },
    { name: 'MongoDB',     category: 'Database' },
    { name: 'Express.js',  category: 'Backend'  },
    { name: 'REST API',    category: 'Backend'  },
    { name: 'Next.js',     category: 'Frontend' },
    { name: 'PostgreSQL',  category: 'Database' },
    { name: 'Docker',      category: 'DevOps'   },
    { name: 'Git',         category: 'Other'    },
    { name: 'JavaScript',  category: 'Language' },
    { name: 'TailwindCSS', category: 'Frontend' },
    { name: 'Redis',       category: 'Database' },
    { name: 'GraphQL',     category: 'Backend'  },
  ],
  data: [
    { name: 'Python',           category: 'Language' },
    { name: 'Machine Learning', category: 'AI/ML'    },
    { name: 'Pandas',           category: 'AI/ML'    },
    { name: 'NumPy',            category: 'AI/ML'    },
    { name: 'TensorFlow',       category: 'AI/ML'    },
    { name: 'PyTorch',          category: 'AI/ML'    },
    { name: 'SQL',              category: 'Database' },
    { name: 'Scikit-learn',     category: 'AI/ML'    },
    { name: 'Statistics',       category: 'AI/ML'    },
    { name: 'Tableau',          category: 'Other'    },
    { name: 'Deep Learning',    category: 'AI/ML'    },
    { name: 'NLP',              category: 'AI/ML'    },
    { name: 'Feature Engineering', category: 'AI/ML' },
  ],
  devops: [
    { name: 'Docker',          category: 'DevOps'   },
    { name: 'Kubernetes',      category: 'DevOps'   },
    { name: 'CI/CD',           category: 'DevOps'   },
    { name: 'Linux',           category: 'Other'    },
    { name: 'AWS',             category: 'DevOps'   },
    { name: 'Terraform',       category: 'DevOps'   },
    { name: 'Ansible',         category: 'DevOps'   },
    { name: 'Bash Scripting',  category: 'Other'    },
    { name: 'GitHub Actions',  category: 'DevOps'   },
    { name: 'Prometheus',      category: 'DevOps'   },
    { name: 'Grafana',         category: 'DevOps'   },
  ],
  mobile: [
    { name: 'Flutter',         category: 'Mobile'   },
    { name: 'Dart',            category: 'Language' },
    { name: 'React Native',    category: 'Mobile'   },
    { name: 'Firebase',        category: 'Database' },
    { name: 'Kotlin',          category: 'Language' },
    { name: 'Swift',           category: 'Language' },
    { name: 'Android SDK',     category: 'Mobile'   },
    { name: 'iOS SDK',         category: 'Mobile'   },
    { name: 'Jetpack Compose', category: 'Mobile'   },
    { name: 'SwiftUI',         category: 'Mobile'   },
  ],
  frontend: [
    { name: 'React.js',    category: 'Frontend' },
    { name: 'TypeScript',  category: 'Language' },
    { name: 'JavaScript',  category: 'Language' },
    { name: 'CSS',         category: 'Frontend' },
    { name: 'HTML',        category: 'Frontend' },
    { name: 'Next.js',     category: 'Frontend' },
    { name: 'TailwindCSS', category: 'Frontend' },
    { name: 'Figma',       category: 'Design'   },
    { name: 'Jest',        category: 'Other'    },
    { name: 'Redux',       category: 'Frontend' },
  ],
  security: [
    { name: 'Cybersecurity',    category: 'Other'    },
    { name: 'Linux',            category: 'Other'    },
    { name: 'Ethical Hacking',  category: 'Other'    },
    { name: 'Python',           category: 'Language' },
    { name: 'Bash Scripting',   category: 'Other'    },
    { name: 'Docker',           category: 'DevOps'   },
    { name: 'Network Security', category: 'Other'    },
  ],
}

// Projects per role
const PROJECT_TEMPLATES = {
  fullstack: [
    { title: 'E-Commerce Platform',     tech: ['React.js', 'Node.js', 'MongoDB', 'Express.js'],         status: 'Completed'    },
    { title: 'Task Management App',     tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'REST API'],       status: 'Completed'    },
    { title: 'Real-Time Chat App',      tech: ['React.js', 'Node.js', 'MongoDB', 'Socket.io'],           status: 'Completed'    },
    { title: 'Blog CMS',                tech: ['Next.js', 'MongoDB', 'TailwindCSS', 'REST API'],         status: 'In Progress'  },
    { title: 'Portfolio Website',       tech: ['React.js', 'TailwindCSS', 'JavaScript'],                 status: 'Completed'    },
    { title: 'Inventory System',        tech: ['Node.js', 'PostgreSQL', 'Express.js', 'React.js'],       status: 'Completed'    },
    { title: 'Job Board Platform',      tech: ['Next.js', 'MongoDB', 'TypeScript', 'Redis'],             status: 'In Progress'  },
  ],
  data: [
    { title: 'Sentiment Analysis Tool', tech: ['Python', 'NLP', 'TensorFlow', 'Pandas'],                 status: 'Completed'    },
    { title: 'House Price Predictor',   tech: ['Python', 'Scikit-learn', 'Pandas', 'NumPy'],             status: 'Completed'    },
    { title: 'Customer Churn Model',    tech: ['Python', 'Machine Learning', 'Pandas', 'SQL'],           status: 'Completed'    },
    { title: 'Stock Price Dashboard',   tech: ['Python', 'Pandas', 'Tableau', 'SQL'],                    status: 'In Progress'  },
    { title: 'Image Classifier',        tech: ['Python', 'PyTorch', 'Deep Learning', 'NumPy'],           status: 'Completed'    },
    { title: 'COVID Data Analysis',     tech: ['Python', 'Pandas', 'Statistics', 'Matplotlib'],          status: 'Completed'    },
  ],
  devops: [
    { title: 'CI/CD Pipeline Setup',    tech: ['Docker', 'GitHub Actions', 'AWS'],                       status: 'Completed'    },
    { title: 'K8s Microservices Deploy', tech: ['Kubernetes', 'Docker', 'Terraform', 'AWS'],             status: 'Completed'    },
    { title: 'Infrastructure as Code',  tech: ['Terraform', 'AWS', 'Ansible'],                           status: 'Completed'    },
    { title: 'Monitoring Dashboard',    tech: ['Prometheus', 'Grafana', 'Linux', 'Docker'],              status: 'In Progress'  },
  ],
  mobile: [
    { title: 'Fitness Tracker App',     tech: ['Flutter', 'Dart', 'Firebase'],                           status: 'Completed'    },
    { title: 'Food Delivery App',       tech: ['React Native', 'Firebase', 'REST API'],                  status: 'Completed'    },
    { title: 'Notes App',               tech: ['Kotlin', 'Android SDK', 'Firebase'],                     status: 'Completed'    },
    { title: 'Weather App',             tech: ['Flutter', 'Dart', 'REST API'],                           status: 'In Progress'  },
    { title: 'E-Commerce Mobile App',   tech: ['React Native', 'REST API', 'JavaScript'],                status: 'Completed'    },
  ],
  frontend: [
    { title: 'Admin Dashboard UI',      tech: ['React.js', 'TailwindCSS', 'TypeScript', 'Recharts'],     status: 'Completed'    },
    { title: 'Design System Library',   tech: ['React.js', 'TypeScript', 'CSS', 'Storybook'],            status: 'In Progress'  },
    { title: 'Landing Page Builder',    tech: ['Next.js', 'TailwindCSS', 'JavaScript'],                  status: 'Completed'    },
    { title: 'Resume Builder App',      tech: ['React.js', 'CSS', 'JavaScript'],                        status: 'Completed'    },
  ],
  security: [
    { title: 'Vulnerability Scanner',   tech: ['Python', 'Linux', 'Ethical Hacking'],                    status: 'Completed'    },
    { title: 'Network Audit Tool',      tech: ['Python', 'Bash Scripting', 'Linux'],                     status: 'In Progress'  },
  ],
}

// Certifications
const CERT_POOL = [
  { name: 'AWS Certified Developer Associate',      issuer: 'Amazon Web Services' },
  { name: 'Google Data Analytics Professional',     issuer: 'Google'              },
  { name: 'Meta Front-End Developer Certificate',   issuer: 'Meta'                },
  { name: 'MongoDB Developer Certification',        issuer: 'MongoDB'             },
  { name: 'Microsoft Azure Fundamentals (AZ-900)',  issuer: 'Microsoft'           },
  { name: 'Certified Kubernetes Administrator',     issuer: 'CNCF'                },
  { name: 'TensorFlow Developer Certificate',       issuer: 'Google'              },
  { name: 'Full Stack Web Development',             issuer: 'Coursera'            },
  { name: 'Python for Data Science',                issuer: 'IBM'                 },
  { name: 'React Developer Certification',          issuer: 'Udemy'               },
  { name: 'AWS Machine Learning Specialty',         issuer: 'Amazon Web Services' },
  { name: 'Ethical Hacking Certified',              issuer: 'EC-Council'          },
  { name: 'Docker Certified Associate',             issuer: 'Docker'              },
  { name: 'Flutter & Dart Development',             issuer: 'Udacity'             },
]

// Employers
const EMPLOYERS = [
  {
    name:        'Karthik Rajan',
    email:       'karthik@techcorp.io',
    companyName: 'TechCorp Solutions',
    industry:    'Software / SaaS',
    location:    'Bangalore, Karnataka',
    website:     'https://techcorp.io',
    description: 'Building next-gen SaaS tools for SMEs. Hiring full-stack and DevOps engineers.',
  },
  {
    name:        'Priya Venkat',
    email:       'priya@dataminds.ai',
    companyName: 'DataMinds AI',
    industry:    'Artificial Intelligence',
    location:    'Chennai, Tamil Nadu',
    website:     'https://dataminds.ai',
    description: 'AI-first startup focusing on predictive analytics for the healthcare sector.',
  },
  {
    name:        'Suresh Babu',
    email:       'suresh@cloudzap.in',
    companyName: 'CloudZap Technologies',
    industry:    'Cloud Infrastructure',
    location:    'Hyderabad, Telangana',
    website:     'https://cloudzap.in',
    description: 'Cloud-native infrastructure company. Looking for DevOps and backend engineers.',
  },
  {
    name:        'Anitha Krishnan',
    email:       'anitha@mobilex.co',
    companyName: 'MobileX Studio',
    industry:    'Mobile Applications',
    location:    'Coimbatore, Tamil Nadu',
    website:     'https://mobilex.co',
    description: 'Award-winning mobile app studio with 50+ published apps. Hiring Flutter & React Native devs.',
  },
  {
    name:        'Ramesh Sundaram',
    email:       'ramesh@finbridge.com',
    companyName: 'FinBridge Technologies',
    industry:    'FinTech',
    location:    'Mumbai, Maharashtra',
    website:     'https://finbridge.com',
    description: 'Digital lending platform processing ₹500Cr monthly. Building the engineering team.',
  },
]

// 50 students — name, focus, cgpa, university, department
const STUDENTS = [
  // IIT Madras — top scorers
  { name: 'Arjun Krishnamurthy', focus: 'fullstack', cgpa: 9.2, uniIdx: 0, deptIdx: 0 },
  { name: 'Divya Raghunathan',   focus: 'data',      cgpa: 9.5, uniIdx: 0, deptIdx: 5 },
  { name: 'Vikram Sundaresan',   focus: 'devops',    cgpa: 8.8, uniIdx: 0, deptIdx: 0 },
  { name: 'Keerthi Balaji',      focus: 'frontend',  cgpa: 9.0, uniIdx: 0, deptIdx: 1 },
  // NIT Trichy
  { name: 'Rahul Murugan',       focus: 'fullstack', cgpa: 8.7, uniIdx: 1, deptIdx: 0 },
  { name: 'Sneha Parthasarathy', focus: 'data',      cgpa: 8.9, uniIdx: 1, deptIdx: 5 },
  { name: 'Arun Venkataraman',   focus: 'mobile',    cgpa: 8.4, uniIdx: 1, deptIdx: 0 },
  { name: 'Lakshmi Subramaniam', focus: 'frontend',  cgpa: 8.6, uniIdx: 1, deptIdx: 1 },
  { name: 'Bharath Chandrasekaran', focus: 'devops', cgpa: 8.1, uniIdx: 1, deptIdx: 0 },
  // Anna University
  { name: 'Preethi Narayanan',   focus: 'frontend',  cgpa: 7.8, uniIdx: 2, deptIdx: 1 },
  { name: 'Naveen Kumar T',      focus: 'fullstack', cgpa: 8.2, uniIdx: 2, deptIdx: 0 },
  { name: 'Geetha Ramachandran', focus: 'data',      cgpa: 8.0, uniIdx: 2, deptIdx: 5 },
  { name: 'Suresh Mohan',        focus: 'devops',    cgpa: 7.5, uniIdx: 2, deptIdx: 2 },
  { name: 'Revathi Dhandapani',  focus: 'mobile',    cgpa: 7.9, uniIdx: 2, deptIdx: 0 },
  { name: 'Dinesh Arumugam',     focus: 'security',  cgpa: 8.3, uniIdx: 2, deptIdx: 0 },
  // VIT Vellore
  { name: 'Meenakshi Iyer',      focus: 'data',      cgpa: 8.8, uniIdx: 3, deptIdx: 5 },
  { name: 'Kiran Shankar',       focus: 'fullstack', cgpa: 8.5, uniIdx: 3, deptIdx: 0 },
  { name: 'Santhosh Pillai',     focus: 'mobile',    cgpa: 8.2, uniIdx: 3, deptIdx: 0 },
  { name: 'Nivetha Rajendran',   focus: 'frontend',  cgpa: 8.7, uniIdx: 3, deptIdx: 1 },
  { name: 'Praveen Muthukumar',  focus: 'devops',    cgpa: 8.0, uniIdx: 3, deptIdx: 0 },
  { name: 'Saranya Gopalakrishnan', focus: 'data',   cgpa: 9.1, uniIdx: 3, deptIdx: 5 },
  // PSG College
  { name: 'Vijay Annamalai',     focus: 'fullstack', cgpa: 7.8, uniIdx: 4, deptIdx: 0 },
  { name: 'Deepika Vasudevan',   focus: 'frontend',  cgpa: 8.1, uniIdx: 4, deptIdx: 1 },
  { name: 'Harish Natarajan',    focus: 'devops',    cgpa: 7.6, uniIdx: 4, deptIdx: 2 },
  { name: 'Kavitha Subramanian', focus: 'data',      cgpa: 8.4, uniIdx: 4, deptIdx: 5 },
  // SSN College
  { name: 'Manoj Sekar',         focus: 'mobile',    cgpa: 8.0, uniIdx: 5, deptIdx: 0 },
  { name: 'Anusha Rengasamy',    focus: 'fullstack', cgpa: 7.9, uniIdx: 5, deptIdx: 0 },
  { name: 'Gowtham Srinivasan',  focus: 'security',  cgpa: 8.2, uniIdx: 5, deptIdx: 0 },
  { name: 'Pavithra Arjunan',    focus: 'frontend',  cgpa: 7.7, uniIdx: 5, deptIdx: 1 },
  { name: 'Bala Krishnan M',     focus: 'data',      cgpa: 8.5, uniIdx: 5, deptIdx: 5 },
  // CIT Coimbatore
  { name: 'Ramya Sekar',         focus: 'fullstack', cgpa: 7.5, uniIdx: 6, deptIdx: 0 },
  { name: 'Selva Kumar P',       focus: 'mobile',    cgpa: 7.8, uniIdx: 6, deptIdx: 0 },
  { name: 'Thenmozhi Nair',      focus: 'data',      cgpa: 7.6, uniIdx: 6, deptIdx: 5 },
  { name: 'Muthuraman A',        focus: 'devops',    cgpa: 7.3, uniIdx: 6, deptIdx: 2 },
  { name: 'Pooja Saravanan',     focus: 'frontend',  cgpa: 7.9, uniIdx: 6, deptIdx: 1 },
  // Thiagarajar College
  { name: 'Senthil Kumar G',     focus: 'fullstack', cgpa: 8.1, uniIdx: 7, deptIdx: 0 },
  { name: 'Lavanya Anand',       focus: 'data',      cgpa: 8.3, uniIdx: 7, deptIdx: 5 },
  { name: 'Venkatesh Prabhu',    focus: 'devops',    cgpa: 7.8, uniIdx: 7, deptIdx: 0 },
  { name: 'Sindhu Krishnaswamy', focus: 'frontend',  cgpa: 8.0, uniIdx: 7, deptIdx: 1 },
  // Kongu Engineering
  { name: 'Murugesan K',         focus: 'mobile',    cgpa: 7.4, uniIdx: 8, deptIdx: 0 },
  { name: 'Ranjani Suresh',      focus: 'fullstack', cgpa: 7.7, uniIdx: 8, deptIdx: 0 },
  { name: 'Aakash Rajaraman',    focus: 'security',  cgpa: 7.5, uniIdx: 8, deptIdx: 0 },
  { name: 'Vijayalakshmi P',     focus: 'data',      cgpa: 7.8, uniIdx: 8, deptIdx: 5 },
  { name: 'Kannan Muthusamy',    focus: 'devops',    cgpa: 7.2, uniIdx: 8, deptIdx: 2 },
  // SASTRA University
  { name: 'Jayashree Venkatesan', focus: 'frontend', cgpa: 8.2, uniIdx: 9, deptIdx: 1 },
  { name: 'Subramanian A',        focus: 'fullstack', cgpa: 8.0, uniIdx: 9, deptIdx: 0 },
  { name: 'Nithya Padmanabhan',   focus: 'data',      cgpa: 8.4, uniIdx: 9, deptIdx: 5 },
  { name: 'Prasanna Kumar R',     focus: 'mobile',    cgpa: 7.9, uniIdx: 9, deptIdx: 0 },
  { name: 'Devi Arulmozhi',       focus: 'security',  cgpa: 8.1, uniIdx: 9, deptIdx: 0 },
  { name: 'Sivakumar Balakrishnan', focus: 'devops',  cgpa: 7.6, uniIdx: 9, deptIdx: 2 },
]

// ── Helpers ────────────────────────────────────────────────────────────────

const pick  = arr => arr[Math.floor(Math.random() * arr.length)]
const picks = (arr, min, max) => {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB:', MONGO_URI)

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      Project.deleteMany({}),
      Certification.deleteMany({}),
    ])
    console.log('🗑  Cleared existing data')

    const hashedStudentPass  = await bcrypt.hash('Student123!', 12)
    const hashedEmployerPass = await bcrypt.hash('Employer123!', 12)
    const hashedAdminPass    = await bcrypt.hash('Admin123!', 12)

    // ── Admin ──────────────────────────────────────────────────────────────
    await User.create({
      name:     'SkillBridge Admin',
      email:    'admin@skillbridge.in',
      password: hashedAdminPass,
      role:     'admin',
    })
    console.log('👤 Admin created  → admin@skillbridge.in / Admin123!')

    // ── Employers ──────────────────────────────────────────────────────────
    for (const emp of EMPLOYERS) {
      await User.create({
        ...emp,
        password:       hashedEmployerPass,
        role:           'employer',
        employerStatus: 'approved',
      })
    }
    console.log(`🏢 ${EMPLOYERS.length} employers created  → password: Employer123!`)

    // ── Students ───────────────────────────────────────────────────────────
    let skillCount = 0, projectCount = 0, certCount = 0

    for (let i = 0; i < STUDENTS.length; i++) {
      const s = STUDENTS[i]
      const emailSlug = s.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
      const age = 20 + Math.floor(Math.random() * 4) // 20–23

      const student = await User.create({
        name:       s.name,
        email:      `${emailSlug}@student.ac.in`,
        password:   hashedStudentPass,
        role:       'student',
        age,
        cgpa:       s.cgpa,
        university: UNIVERSITIES[s.uniIdx],
        department: DEPARTMENTS[s.deptIdx],
        github:     `https://github.com/${emailSlug}`,
        linkedin:   `https://linkedin.com/in/${emailSlug}`,
        bio:        `${s.focus.charAt(0).toUpperCase() + s.focus.slice(1)} developer student from ${UNIVERSITIES[s.uniIdx]}.`,
      })

      // Skills — pick 5–10 from focus pool + 0–2 from another pool
      const mainPool  = SKILL_POOLS[s.focus] || SKILL_POOLS.fullstack
      const crossKeys = Object.keys(SKILL_POOLS).filter(k => k !== s.focus)
      const crossPool = SKILL_POOLS[pick(crossKeys)] || []

      const selectedSkills = [
        ...picks(mainPool, 4, 8),
        ...picks(crossPool, 0, 2),
      ]
      // deduplicate by name
      const uniqueSkills = selectedSkills.filter((sk, idx, arr) =>
        arr.findIndex(x => x.name === sk.name) === idx
      )

      for (const sk of uniqueSkills) {
        // Higher cgpa students tend to have higher skill levels
        const levelIdx = s.cgpa >= 9.0 ? 2 + Math.floor(Math.random() * 2)
                       : s.cgpa >= 8.0 ? 1 + Math.floor(Math.random() * 2)
                       : Math.floor(Math.random() * 2)
        await Skill.create({
          student:  student._id,
          name:     sk.name,
          category: sk.category,
          level:    SKILL_LEVELS[Math.min(levelIdx, SKILL_LEVELS.length - 1)],
        })
        skillCount++
      }

      // Projects — pick 1–3 from focus pool + maybe 1 from another
      const projPool = PROJECT_TEMPLATES[s.focus] || PROJECT_TEMPLATES.fullstack
      const selectedProjs = picks(projPool, 1, 3)
      for (const p of selectedProjs) {
        await Project.create({
          student:     student._id,
          title:       p.title,
          description: `${p.title} built using ${p.tech.slice(0, 3).join(', ')}. A project demonstrating ${s.focus} skills.`,
          tech:        p.tech,
          github:      `https://github.com/${emailSlug}/${p.title.toLowerCase().replace(/\s+/g, '-')}`,
          status:      p.status,
        })
        projectCount++
      }

      // Certifications — 0–2, higher cgpa = more likely
      const certChance = s.cgpa >= 8.5 ? 2 : s.cgpa >= 7.5 ? 1 : 0
      const selectedCerts = picks(CERT_POOL, 0, certChance)
      for (const c of selectedCerts) {
        const year  = 2023 + Math.floor(Math.random() * 2)
        const month = 1 + Math.floor(Math.random() * 12)
        await Certification.create({
          student:      student._id,
          name:         c.name,
          issuer:       c.issuer,
          date:         new Date(year, month - 1, 1),
          credentialId: `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          url:          `https://credentials.example.com/verify/${Math.random().toString(36).substring(2, 12)}`,
        })
        certCount++
      }

      if ((i + 1) % 10 === 0) console.log(`  ✓ ${i + 1}/${STUDENTS.length} students seeded…`)
    }

    console.log('\n═══════════════════════════════════════════')
    console.log('✅  SEEDING COMPLETE')
    console.log('───────────────────────────────────────────')
    console.log(`👥  Students:       ${STUDENTS.length}`)
    console.log(`🏢  Employers:      ${EMPLOYERS.length}`)
    console.log(`🛠   Skills:         ${skillCount}`)
    console.log(`📁  Projects:       ${projectCount}`)
    console.log(`🎓  Certifications: ${certCount}`)
    console.log('───────────────────────────────────────────')
    console.log('Login credentials:')
    console.log('  Admin    → admin@skillbridge.in     / Admin123!')
    console.log('  Employer → karthik@techcorp.io      / Employer123!')
    console.log('  Employer → priya@dataminds.ai       / Employer123!')
    console.log('  Student  → arjun.krishnamurthy@student.ac.in / Student123!')
    console.log('  (All students share password: Student123!)')
    console.log('═══════════════════════════════════════════\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seeder error:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

seed()
