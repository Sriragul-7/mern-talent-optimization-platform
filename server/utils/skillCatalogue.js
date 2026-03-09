/**
 * SkillBridge — Master Skill Catalogue
 * ─────────────────────────────────────────────────────────────────────────────
 * ~250 skills mapped to domains with predefined weights (1–5).
 * Weight reflects market demand and difficulty level.
 *   5 = Critical / highest demand
 *   4 = High demand
 *   3 = Moderate
 *   2 = Supplementary
 *   1 = Basic / entry
 *
 * Used by:
 *   - MySkills dropdown (frontend)
 *   - Readiness score engine (backend)
 *   - Action plan & recommendation engine (backend)
 */

const SKILL_CATALOGUE = {

  // ── Frontend ──────────────────────────────────────────────────────────────
  Frontend: [
    { name: 'React.js',         weight: 5 },
    { name: 'Next.js',          weight: 5 },
    { name: 'TypeScript',       weight: 5 },
    { name: 'JavaScript',       weight: 5 },
    { name: 'HTML',             weight: 3 },
    { name: 'CSS',              weight: 3 },
    { name: 'TailwindCSS',      weight: 4 },
    { name: 'Vue.js',           weight: 4 },
    { name: 'Angular',          weight: 4 },
    { name: 'Svelte',           weight: 3 },
    { name: 'Redux',            weight: 4 },
    { name: 'Zustand',          weight: 3 },
    { name: 'React Query',      weight: 4 },
    { name: 'GraphQL (client)', weight: 4 },
    { name: 'Webpack',          weight: 3 },
    { name: 'Vite',             weight: 3 },
    { name: 'Storybook',        weight: 3 },
    { name: 'Jest',             weight: 4 },
    { name: 'Cypress',          weight: 3 },
    { name: 'Playwright',       weight: 3 },
    { name: 'SASS/SCSS',        weight: 2 },
    { name: 'Figma',            weight: 3 },
    { name: 'WebGL',            weight: 2 },
    { name: 'Three.js',         weight: 2 },
    { name: 'D3.js',            weight: 3 },
    { name: 'Framer Motion',    weight: 2 },
    { name: 'GSAP',             weight: 2 },
    { name: 'Material UI',      weight: 3 },
    { name: 'Chakra UI',        weight: 2 },
    { name: 'shadcn/ui',        weight: 3 },
  ],

  // ── Backend ───────────────────────────────────────────────────────────────
  Backend: [
    { name: 'Node.js',          weight: 5 },
    { name: 'Express.js',       weight: 4 },
    { name: 'Python',           weight: 5 },
    { name: 'FastAPI',          weight: 4 },
    { name: 'Django',           weight: 4 },
    { name: 'Flask',            weight: 3 },
    { name: 'Java',             weight: 5 },
    { name: 'Spring Boot',      weight: 5 },
    { name: 'Go',               weight: 4 },
    { name: 'Rust',             weight: 3 },
    { name: 'C#',               weight: 4 },
    { name: '.NET Core',        weight: 4 },
    { name: 'PHP',              weight: 3 },
    { name: 'Laravel',          weight: 3 },
    { name: 'Ruby on Rails',    weight: 3 },
    { name: 'REST API',         weight: 5 },
    { name: 'GraphQL',          weight: 4 },
    { name: 'gRPC',             weight: 3 },
    { name: 'WebSockets',       weight: 3 },
    { name: 'Microservices',    weight: 4 },
    { name: 'Message Queues',   weight: 3 },
    { name: 'Apache Kafka',     weight: 4 },
    { name: 'RabbitMQ',         weight: 3 },
    { name: 'Redis',            weight: 4 },
    { name: 'Firebase',         weight: 3 },
    { name: 'Supabase',         weight: 3 },
    { name: 'Socket.io',        weight: 3 },
    { name: 'Nginx',            weight: 3 },
    { name: 'Apache Spark',     weight: 3 },
    { name: 'Celery',           weight: 2 },
    { name: 'Solidity',         weight: 2 },
  ],

  // ── Database ──────────────────────────────────────────────────────────────
  Database: [
    { name: 'SQL',              weight: 5 },
    { name: 'PostgreSQL',       weight: 5 },
    { name: 'MySQL',            weight: 4 },
    { name: 'MongoDB',          weight: 4 },
    { name: 'SQLite',           weight: 2 },
    { name: 'Redis',            weight: 4 },
    { name: 'Elasticsearch',    weight: 4 },
    { name: 'DynamoDB',         weight: 3 },
    { name: 'Cassandra',        weight: 3 },
    { name: 'Neo4j',            weight: 2 },
    { name: 'InfluxDB',         weight: 2 },
    { name: 'Pinecone',         weight: 2 },
    { name: 'Firestore',        weight: 3 },
    { name: 'Supabase DB',      weight: 3 },
    { name: 'Prisma ORM',       weight: 3 },
    { name: 'TypeORM',          weight: 3 },
    { name: 'Mongoose',         weight: 3 },
    { name: 'Database Design',  weight: 4 },
    { name: 'Query Optimisation',weight: 4 },
  ],

  // ── AI/ML ─────────────────────────────────────────────────────────────────
  'AI/ML': [
    { name: 'Machine Learning', weight: 5 },
    { name: 'Deep Learning',    weight: 5 },
    { name: 'TensorFlow',       weight: 5 },
    { name: 'PyTorch',          weight: 5 },
    { name: 'Scikit-learn',     weight: 4 },
    { name: 'Pandas',           weight: 4 },
    { name: 'NumPy',            weight: 4 },
    { name: 'Matplotlib',       weight: 3 },
    { name: 'Seaborn',          weight: 2 },
    { name: 'Statistics',       weight: 4 },
    { name: 'NLP',              weight: 4 },
    { name: 'Computer Vision',  weight: 4 },
    { name: 'Transformers',     weight: 5 },
    { name: 'LangChain',        weight: 4 },
    { name: 'OpenAI API',       weight: 4 },
    { name: 'Hugging Face',     weight: 4 },
    { name: 'MLflow',           weight: 3 },
    { name: 'Weights & Biases', weight: 3 },
    { name: 'Feature Engineering', weight: 4 },
    { name: 'Model Deployment', weight: 4 },
    { name: 'Data Preprocessing', weight: 4 },
    { name: 'A/B Testing',      weight: 3 },
    { name: 'Time Series',      weight: 3 },
    { name: 'Reinforcement Learning', weight: 3 },
    { name: 'Tableau',          weight: 3 },
    { name: 'Power BI',         weight: 3 },
    { name: 'Apache Spark (ML)',weight: 3 },
    { name: 'CUDA',             weight: 2 },
  ],

  // ── DevOps / Cloud ────────────────────────────────────────────────────────
  DevOps: [
    { name: 'Docker',           weight: 5 },
    { name: 'Kubernetes',       weight: 5 },
    { name: 'CI/CD',            weight: 5 },
    { name: 'AWS',              weight: 5 },
    { name: 'Google Cloud',     weight: 4 },
    { name: 'Azure',            weight: 4 },
    { name: 'Terraform',        weight: 5 },
    { name: 'Ansible',          weight: 4 },
    { name: 'Helm',             weight: 3 },
    { name: 'Linux',            weight: 5 },
    { name: 'Bash Scripting',   weight: 4 },
    { name: 'GitHub Actions',   weight: 4 },
    { name: 'Jenkins',          weight: 3 },
    { name: 'ArgoCD',           weight: 3 },
    { name: 'Prometheus',       weight: 3 },
    { name: 'Grafana',          weight: 3 },
    { name: 'ELK Stack',        weight: 3 },
    { name: 'Nginx',            weight: 3 },
    { name: 'Git',              weight: 5 },
    { name: 'Networking',       weight: 3 },
    { name: 'Security (DevSecOps)', weight: 4 },
    { name: 'Serverless',       weight: 4 },
    { name: 'CDN Management',   weight: 2 },
    { name: 'SRE Practices',    weight: 3 },
  ],

  // ── Mobile ────────────────────────────────────────────────────────────────
  Mobile: [
    { name: 'Flutter',          weight: 5 },
    { name: 'Dart',             weight: 4 },
    { name: 'React Native',     weight: 5 },
    { name: 'Swift',            weight: 5 },
    { name: 'SwiftUI',          weight: 4 },
    { name: 'Kotlin',           weight: 5 },
    { name: 'Jetpack Compose',  weight: 4 },
    { name: 'Android SDK',      weight: 4 },
    { name: 'iOS SDK',          weight: 4 },
    { name: 'Expo',             weight: 3 },
    { name: 'Firebase',         weight: 3 },
    { name: 'App Store Deployment', weight: 3 },
    { name: 'Push Notifications', weight: 2 },
    { name: 'SQLite (Mobile)',  weight: 2 },
    { name: 'REST API',         weight: 4 },
  ],

  // ── Language ──────────────────────────────────────────────────────────────
  Language: [
    { name: 'Python',           weight: 5 },
    { name: 'JavaScript',       weight: 5 },
    { name: 'TypeScript',       weight: 5 },
    { name: 'Java',             weight: 5 },
    { name: 'C++',              weight: 4 },
    { name: 'C',                weight: 3 },
    { name: 'C#',               weight: 4 },
    { name: 'Go',               weight: 4 },
    { name: 'Rust',             weight: 3 },
    { name: 'Kotlin',           weight: 4 },
    { name: 'Swift',            weight: 4 },
    { name: 'Dart',             weight: 3 },
    { name: 'Ruby',             weight: 2 },
    { name: 'PHP',              weight: 3 },
    { name: 'Scala',            weight: 2 },
    { name: 'R',                weight: 3 },
    { name: 'MATLAB',           weight: 2 },
    { name: 'Bash/Shell',       weight: 4 },
    { name: 'SQL',              weight: 5 },
    { name: 'Solidity',         weight: 2 },
  ],

  // ── Design ────────────────────────────────────────────────────────────────
  Design: [
    { name: 'Figma',            weight: 5 },
    { name: 'Adobe XD',         weight: 3 },
    { name: 'Sketch',           weight: 2 },
    { name: 'UI/UX Design',     weight: 4 },
    { name: 'Wireframing',      weight: 3 },
    { name: 'Prototyping',      weight: 3 },
    { name: 'User Research',    weight: 3 },
    { name: 'Design Systems',   weight: 4 },
    { name: 'Accessibility (a11y)', weight: 3 },
    { name: 'Adobe Illustrator', weight: 2 },
    { name: 'Photoshop',        weight: 2 },
    { name: 'Motion Design',    weight: 2 },
    { name: 'Brand Design',     weight: 2 },
  ],

  // ── Other / Tools ─────────────────────────────────────────────────────────
  Other: [
    { name: 'Git',              weight: 5 },
    { name: 'GitHub',           weight: 4 },
    { name: 'Agile / Scrum',    weight: 4 },
    { name: 'Jira',             weight: 3 },
    { name: 'System Design',    weight: 5 },
    { name: 'Data Structures',  weight: 5 },
    { name: 'Algorithms',       weight: 5 },
    { name: 'Problem Solving',  weight: 5 },
    { name: 'Technical Writing', weight: 2 },
    { name: 'Unity',            weight: 2 },
    { name: 'Unreal Engine',    weight: 2 },
    { name: 'OpenGL',           weight: 2 },
    { name: 'WebGL',            weight: 2 },
    { name: 'Blockchain',       weight: 2 },
    { name: 'AR/VR Development', weight: 2 },
    { name: 'Robotics',         weight: 2 },
    { name: 'Embedded Systems', weight: 2 },
    { name: 'IoT',              weight: 2 },
    { name: 'Cybersecurity',    weight: 3 },
    { name: 'Ethical Hacking',  weight: 2 },
  ],
}

// Flat lookup: skill name → { category, weight }
const SKILL_LOOKUP = {}
Object.entries(SKILL_CATALOGUE).forEach(([category, skills]) => {
  skills.forEach(s => {
    SKILL_LOOKUP[s.name.toLowerCase()] = { category, weight: s.weight, name: s.name }
  })
})

// All skill names sorted alphabetically (for dropdown)
const ALL_SKILL_NAMES = Object.values(SKILL_CATALOGUE)
  .flat()
  .map(s => s.name)
  .sort((a, b) => a.localeCompare(b))

module.exports = { SKILL_CATALOGUE, SKILL_LOOKUP, ALL_SKILL_NAMES }
