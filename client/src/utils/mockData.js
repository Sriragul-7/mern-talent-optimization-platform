export const MOCK_STUDENT = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@college.edu',
  age: 22,
  cgpa: 8.7,
  university: 'NIT Trichy',
  department: 'Computer Science',
  github: 'https://github.com/arjunsharma',
  linkedin: 'https://linkedin.com/in/arjunsharma',
  role: 'student',
  profileCompletion: 82,
}

export const MOCK_EMPLOYER = {
  name: 'Priya Mehta',
  companyName: 'InnovateTech Solutions',
  email: 'priya@innovatetech.io',
  role: 'employer',
}

export const MOCK_SKILLS = [
  { _id: '1', name: 'React.js', category: 'Frontend', level: 'Advanced', levelNum: 4 },
  { _id: '2', name: 'Node.js', category: 'Backend', level: 'Intermediate', levelNum: 3 },
  { _id: '3', name: 'Python', category: 'Language', level: 'Advanced', levelNum: 4 },
  { _id: '4', name: 'MongoDB', category: 'Database', level: 'Intermediate', levelNum: 3 },
  { _id: '5', name: 'TailwindCSS', category: 'Frontend', level: 'Expert', levelNum: 5 },
  { _id: '6', name: 'Machine Learning', category: 'AI/ML', level: 'Beginner', levelNum: 2 },
]

export const MOCK_PROJECTS = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    description: 'Full-stack MERN e-commerce with cart, payment integration, and admin panel.',
    tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    github: 'https://github.com/arjun/ecommerce',
    live: 'https://ecommerce-demo.vercel.app',
    status: 'Completed',
  },
  {
    _id: '2',
    title: 'AI Chatbot',
    description: 'Intelligent chatbot using NLP and transformer models for customer support.',
    tech: ['Python', 'FastAPI', 'React', 'OpenAI'],
    github: 'https://github.com/arjun/chatbot',
    status: 'In Progress',
  },
]

export const MOCK_CERTS = [
  { _id: '1', name: 'AWS Certified Developer', issuer: 'Amazon', date: '2024-03-15', credentialId: 'AWS-DEV-2024' },
  { _id: '2', name: 'MongoDB Developer Certification', issuer: 'MongoDB Inc', date: '2023-11-20', credentialId: 'MDB-2023' },
  { _id: '3', name: 'React Advanced Patterns', issuer: 'Udemy', date: '2024-01-10', credentialId: 'UD-REACT-ADV' },
]

export const MOCK_RECOMMENDATIONS = [
  {
    id: '1',
    type: 'skill',
    priority: 'high',
    title: 'Learn TypeScript',
    description: 'Based on your React expertise, TypeScript would significantly enhance your job prospects. 87% of React roles now require TS.',
    action: 'Start Learning',
    actionUrl: 'https://www.typescriptlang.org/docs/',
    icon: 'code',
  },
  {
    id: '2',
    type: 'project',
    priority: 'medium',
    title: 'Build a Cloud-Deployed App',
    description: 'Add a project with AWS/GCP deployment to your portfolio. Employers in your target stack prioritize cloud experience.',
    action: 'Get Ideas',
    icon: 'cloud',
  },
  {
    id: '3',
    type: 'cert',
    priority: 'medium',
    title: 'Consider Docker Certification',
    description: 'Container skills gap detected. Docker/Kubernetes proficiency is requested in 64% of backend roles you match.',
    action: 'View Certification',
    icon: 'award',
  },
  {
    id: '4',
    type: 'profile',
    priority: 'low',
    title: 'Complete Your Profile',
    description: 'Profiles with GitHub activity and a bio get 3× more employer views. Add a summary to stand out.',
    action: 'Update Profile',
    icon: 'user',
  },
]

export const MOCK_SKILL_GAP = {
  targetRole: 'Full Stack Developer',
  match: 72,
  gaps: [
    { skill: 'TypeScript', importance: 'High', current: 0, required: 3 },
    { skill: 'Docker', importance: 'High', current: 0, required: 3 },
    { skill: 'Redis', importance: 'Medium', current: 0, required: 2 },
    { skill: 'GraphQL', importance: 'Medium', current: 1, required: 3 },
  ],
  strengths: ['React.js', 'Node.js', 'MongoDB', 'Python'],
}

export const MOCK_DASHBOARD_STATS = {
  skills: 6,
  projects: 2,
  certifications: 3,
  profileCompletion: 82,
  skillProgress: [
    { month: 'Aug', value: 2 },
    { month: 'Sep', value: 3 },
    { month: 'Oct', value: 3 },
    { month: 'Nov', value: 5 },
    { month: 'Dec', value: 5 },
    { month: 'Jan', value: 6 },
  ],
  skillDistribution: [
    { skill: 'Frontend', value: 75 },
    { skill: 'Backend', value: 60 },
    { skill: 'Database', value: 55 },
    { skill: 'AI/ML', value: 30 },
    { skill: 'DevOps', value: 25 },
    { skill: 'Languages', value: 70 },
  ],
  skillsByCategory: [
    { name: 'Frontend', value: 2 },
    { name: 'Backend', value: 2 },
    { name: 'Database', value: 1 },
    { name: 'AI/ML', value: 1 },
  ],
  skillProgressBars: MOCK_SKILLS.map(s => ({ name: s.name, level: s.levelNum })),
}

export const MOCK_EMPLOYER_STATS = {
  totalStudents: 1247,
  activeSkills: 89,
  avgCgpa: 7.8,
  universities: 34,
  topSkills: [
    { name: 'React.js', count: 423 },
    { name: 'Python', count: 389 },
    { name: 'Node.js', count: 301 },
    { name: 'Machine Learning', count: 218 },
    { name: 'Java', count: 198 },
    { name: 'MongoDB', count: 176 },
  ],
  cgpaDistribution: [
    { range: '9-10', count: 89 },
    { range: '8-9', count: 312 },
    { range: '7-8', count: 478 },
    { range: '6-7', count: 289 },
    { range: '<6', count: 79 },
  ],
  monthlyActivity: [
    { month: 'Aug', value: 45 },
    { month: 'Sep', value: 67 },
    { month: 'Oct', value: 89 },
    { month: 'Nov', value: 120 },
    { month: 'Dec', value: 98 },
    { month: 'Jan', value: 145 },
  ],
}

export const MOCK_TALENT = [
  {
    _id: '1',
    name: 'Arjun Sharma',
    university: 'NIT Trichy',
    department: 'Computer Science',
    cgpa: 8.7,
    skills: ['React.js', 'Node.js', 'Python', 'MongoDB'],
    github: 'https://github.com/arjunsharma',
    linkedin: 'https://linkedin.com/in/arjunsharma',
  },
  {
    _id: '2',
    name: 'Sneha Patel',
    university: 'IIT Bombay',
    department: 'Information Technology',
    cgpa: 9.1,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Keras'],
    github: 'https://github.com/snehapatel',
    linkedin: 'https://linkedin.com/in/snehapatel',
  },
  {
    _id: '3',
    name: 'Rahul Verma',
    university: 'VIT Vellore',
    department: 'Computer Science',
    cgpa: 8.2,
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
    github: 'https://github.com/rahulverma',
    linkedin: 'https://linkedin.com/in/rahulverma',
  },
  {
    _id: '4',
    name: 'Anjali Singh',
    university: 'BITS Pilani',
    department: 'Electronics & CS',
    cgpa: 8.9,
    skills: ['React.js', 'TypeScript', 'GraphQL', 'AWS'],
    github: 'https://github.com/anjalisingh',
    linkedin: 'https://linkedin.com/in/anjalisingh',
  },
  {
    _id: '5',
    name: 'Karthik Raj',
    university: 'NIT Surathkal',
    department: 'Information Science',
    cgpa: 7.9,
    skills: ['Node.js', 'MongoDB', 'Redis', 'Kubernetes'],
    github: 'https://github.com/karthikraj',
    linkedin: 'https://linkedin.com/in/karthikraj',
  },
  {
    _id: '6',
    name: 'Priya Krishnan',
    university: 'Anna University',
    department: 'Computer Science',
    cgpa: 8.4,
    skills: ['Django', 'Python', 'PostgreSQL', 'REST API'],
    github: 'https://github.com/priyakrishnan',
    linkedin: 'https://linkedin.com/in/priyakrishnan',
  },
]
