const mongoose = require("mongoose")
require("dotenv").config()

const User = require("./models/User")
const Skill = require("./models/Skill")
const Project = require("./models/Project")
const Certification = require("./models/Certification")

mongoose.connect(process.env.MONGO_URI)

const STUDENTS = 500 // Increased for better analytics
const seedEmails = []

// Enhanced Universities with locations and rankings
const universities = [
  { name: "Anna University", location: "Chennai", ranking: "A+" },
  { name: "IIT Madras", location: "Chennai", ranking: "A++" },
  { name: "NIT Trichy", location: "Trichy", ranking: "A+" },
  { name: "VIT", location: "Vellore", ranking: "A" },
  { name: "SRM", location: "Chennai", ranking: "A" },
  { name: "PSG Tech", location: "Coimbatore", ranking: "A+" },
  { name: "Amrita University", location: "Coimbatore", ranking: "A" },
  { name: "BITS Pilani", location: "Pilani", ranking: "A++" },
  { name: "Delhi University", location: "Delhi", ranking: "A+" },
  { name: "MIT", location: "Chennai", ranking: "A" },
  { name: "IIIT Hyderabad", location: "Hyderabad", ranking: "A++" },
  { name: "IIT Bombay", location: "Mumbai", ranking: "A++" },
  { name: "IIT Delhi", location: "Delhi", ranking: "A++" },
  { name: "JNTU", location: "Hyderabad", ranking: "B+" },
  { name: "KIIT", location: "Bhubaneswar", ranking: "A" }
]

// Departments with more variety
const departments = [
  "Computer Science", "Information Technology", "AI & ML", 
  "Data Science", "Cyber Security", "Electronics", 
  "Electrical Engineering", "Mechanical", "Civil",
  "Biotechnology", "Chemical Engineering", "Mathematics",
  "Physics", "Robotics", "IoT"
]

// Academic years
const academicYears = [1, 2, 3, 4, 5]

// Skill categories with proficiency levels and popularity metrics
const skillGroups = {
  frontend: {
    skills: ["React", "Next.js", "Angular", "Vue", "Svelte", "HTML5", "CSS3", "Tailwind", "Bootstrap", "Material UI", "Redux", "Webpack"],
    popularity: { beginner: 40, intermediate: 35, advanced: 20, expert: 5 }
  },
  backend: {
    skills: ["Node.js", "Express", "Spring Boot", "Django", "Flask", "Laravel", "Ruby on Rails", "ASP.NET", "FastAPI", "GraphQL", "REST APIs", "Microservices"],
    popularity: { beginner: 30, intermediate: 40, advanced: 25, expert: 5 }
  },
  programming: {
    skills: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "C#", "PHP", "Swift", "Kotlin", "Ruby", "Scala"],
    popularity: { beginner: 25, intermediate: 40, advanced: 30, expert: 5 }
  },
  database: {
    skills: ["MongoDB", "MySQL", "PostgreSQL", "Redis", "Firebase", "Elasticsearch", "Cassandra", "Oracle", "SQLite", "DynamoDB", "Neo4j"],
    popularity: { beginner: 35, intermediate: 40, advanced: 20, expert: 5 }
  },
  ai: {
    skills: ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Computer Vision", "NLP", "LLMs", "Generative AI", "OpenAI", "LangChain", "Hugging Face", "Data Science"],
    popularity: { beginner: 30, intermediate: 35, advanced: 25, expert: 10 }
  },
  devops: {
    skills: ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Linux", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Prometheus"],
    popularity: { beginner: 25, intermediate: 35, advanced: 30, expert: 10 }
  },
  mobile: {
    skills: ["React Native", "Flutter", "iOS", "Android", "Kotlin", "SwiftUI", "Xamarin", "Ionic"],
    popularity: { beginner: 40, intermediate: 35, advanced: 20, expert: 5 }
  },
  testing: {
    skills: ["Jest", "Mocha", "Cypress", "Selenium", "JUnit", "PyTest", "TestNG", "Postman", "JIRA"],
    popularity: { beginner: 45, intermediate: 35, advanced: 15, expert: 5 }
  },
  cloud: {
    skills: ["AWS", "Azure", "GCP", "Cloud Architecture", "Serverless", "Lambda", "EC2", "S3", "CloudFormation"],
    popularity: { beginner: 30, intermediate: 35, advanced: 25, expert: 10 }
  }
}

// Realistic project titles
const projectTemplates = {
  frontend: [
    "E-commerce Platform", "Portfolio Website", "Dashboard UI", "Social Media App",
    "Weather App", "Task Manager", "Chat Application", "Blog Platform"
  ],
  backend: [
    "REST API Service", "Authentication System", "Payment Gateway", "Content Management System",
    "Inventory Management", "Order Processing System", "Analytics Dashboard"
  ],
  ai: [
    "Image Recognition System", "Chatbot Application", "Recommendation Engine",
    "Sentiment Analysis Tool", "Fraud Detection System", "Predictive Model"
  ],
  mobile: [
    "Fitness Tracker App", "Food Delivery App", "Ride Sharing App", "Note Taking App",
    "Expense Tracker", "Meditation App", "Social Media Client"
  ],
  devops: [
    "CI/CD Pipeline", "Container Orchestration", "Cloud Migration", "Monitoring Solution",
    "Infrastructure as Code", "Automated Deployment System"
  ]
}

// Technologies for projects
const techStacks = {
  frontend: ["React", "Next.js", "Vue", "Angular", "Tailwind", "Redux", "TypeScript", "Material UI"],
  backend: ["Node.js", "Python", "Java", "Go", "Express", "Django", "Spring Boot", "PostgreSQL"],
  database: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "Elasticsearch"],
  devops: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "GitHub Actions"],
  ai: ["TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "OpenCV", "NLTK"]
}

// Certifications with categories
const certifications = [
  { name: "AWS Certified Cloud Practitioner", category: "Cloud", issuer: "AWS" },
  { name: "AWS Solutions Architect", category: "Cloud", issuer: "AWS" },
  { name: "Google Cloud Associate Engineer", category: "Cloud", issuer: "Google" },
  { name: "Microsoft Azure Fundamentals", category: "Cloud", issuer: "Microsoft" },
  { name: "Meta Frontend Developer", category: "Frontend", issuer: "Meta" },
  { name: "Google UX Design", category: "Design", issuer: "Google" },
  { name: "IBM Data Science", category: "Data Science", issuer: "IBM" },
  { name: "Deep Learning Specialization", category: "AI", issuer: "DeepLearning.AI" },
  { name: "TensorFlow Developer Certificate", category: "AI", issuer: "Google" },
  { name: "Kubernetes Administrator", category: "DevOps", issuer: "CNCF" },
  { name: "Docker Certified Associate", category: "DevOps", issuer: "Docker" },
  { name: "CompTIA Security+", category: "Security", issuer: "CompTIA" },
  { name: "CISSP", category: "Security", issuer: "ISC2" },
  { name: "Oracle Certified Professional", category: "Database", issuer: "Oracle" },
  { name: "MongoDB Certification", category: "Database", issuer: "MongoDB" },
  { name: "Scrum Master", category: "Management", issuer: "Scrum Alliance" },
  { name: "PMP", category: "Management", issuer: "PMI" }
]

// Achievement levels for students
const achievementLevels = ["High Achiever", "Average", "Struggling", "Excellent", "Good"]

// Companies for internships/jobs
const companies = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber",
  "Flipkart", "Zomato", "Swiggy", "Paytm", "Razorpay", "Freshworks",
  "Zoho", "TCS", "Infosys", "Wipro", "Accenture", "Deloitte", "PwC"
]

// --------------------
// STUDENT CREATOR
// --------------------
const createStudents = () => {
  const students = []
  
  for(let i = 1; i <= STUDENTS; i++) {
    const email = `student${i}@seed.com`
    seedEmails.push(email)
    
    // Generate more realistic data
    const age = 18 + Math.floor(Math.random() * 8) // 18-25
    const cgpa = (5.5 + (Math.random() * 4)).toFixed(2) // 5.5 to 9.5
    const academicYear = Math.floor(Math.random() * 4) + 1
    
    // Assign achievement based on CGPA
    let achievement = "Average"
    if(cgpa >= 8.5) achievement = "High Achiever"
    else if(cgpa >= 7.5) achievement = "Good"
    else if(cgpa < 6.0) achievement = "Struggling"
    
    // Some students have internship experience
    const hasInternship = Math.random() > 0.7
    const internshipCompany = hasInternship ? companies[Math.floor(Math.random() * companies.length)] : null
    
    // Students from different years have different skills counts
    const skillCount = academicYear === 1 ? Math.floor(Math.random() * 3) + 2 : 
                      academicYear === 2 ? Math.floor(Math.random() * 4) + 4 :
                      academicYear === 3 ? Math.floor(Math.random() * 5) + 6 :
                      Math.floor(Math.random() * 6) + 8
    
    const university = universities[Math.floor(Math.random() * universities.length)]
    
    students.push({
      name: `Student ${i}`,
      email,
      password: "123456",
      role: "student",
      age,
      cgpa: parseFloat(cgpa),
      university: university.name,
      universityLocation: university.location,
      universityRanking: university.ranking,
      department: departments[Math.floor(Math.random() * departments.length)],
      academicYear,
      achievement,
      github: `https://github.com/student${i}`,
      linkedin: `https://linkedin.com/in/student${i}`,
      portfolio: Math.random() > 0.5 ? `https://student${i}.dev` : null,
      bio: generateBio(academicYear, achievement, skillCount),
      internshipCompany: internshipCompany,
      internshipCompleted: hasInternship,
      placementStatus: Math.random() > 0.8 ? "Placed" : "Not Placed", // Some are placed
      placedCompany: Math.random() > 0.8 ? companies[Math.floor(Math.random() * companies.length)] : null,
      expectedSalary: Math.floor(Math.random() * 20) + 5 + " LPA", // 5-25 LPA
      skillsCount: skillCount,
      projectsCount: academicYear === 1 ? Math.floor(Math.random() * 2) + 1 :
                     academicYear === 2 ? Math.floor(Math.random() * 2) + 2 :
                     academicYear === 3 ? Math.floor(Math.random() * 3) + 3 :
                     Math.floor(Math.random() * 4) + 4,
      certificationsCount: Math.floor(Math.random() * 4) // 0-3 certifications
    })
  }
  
  return students
}

// Generate realistic bio based on student profile
function generateBio(year, achievement, skillCount) {
  const bios = [
    `${achievement} student passionate about building scalable applications. ${skillCount}+ technologies explored.`,
    `Computer Science student with focus on full-stack development. Building real-world projects.`,
    `Aspiring ${Math.random() > 0.5 ? 'AI/ML' : 'Cloud'} engineer with hands-on experience in modern tech stacks.`,
    `${achievement} learner constantly exploring new technologies and frameworks. Open to collaborations.`,
    `Tech enthusiast with ${skillCount}+ skills. Looking for opportunities in product-based companies.`,
    `${year}th year student passionate about coding and problem-solving. ${skillCount} technologies mastered.`,
    `Building innovative solutions to real-world problems. ${achievement} student with strong technical background.`
  ]
  return bios[Math.floor(Math.random() * bios.length)]
}

// --------------------
// RANDOM PICK WITH WEIGHTS
// --------------------
function pickRandomWeighted(arr, count, weights = null) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function getSkillLevel(skillCategory) {
  const pop = skillGroups[skillCategory].popularity
  const rand = Math.random() * 100
  
  if(rand < pop.expert) return "Expert"
  if(rand < pop.expert + pop.advanced) return "Advanced"
  if(rand < pop.expert + pop.advanced + pop.intermediate) return "Intermediate"
  return "Beginner"
}

// Generate project description
function generateProjectDescription(techs) {
  const descriptions = [
    `Built using ${techs.join(', ')}. Implemented authentication, real-time updates, and responsive design.`,
    `Full-stack application with ${techs[0]} and ${techs[1]}. Features include user management and analytics.`,
    `Scalable solution leveraging ${techs.join(', ')}. Deployed on cloud with CI/CD pipeline.`,
    `Modern web application showcasing ${techs[0]} integration with ${techs[1]} backend.`,
    `Industry-grade project with ${techs[0]}, ${techs[1]}, and ${techs[2]}. Followed best practices.`
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// --------------------
// IMPORT DATA
// --------------------
const importData = async () => {
  try {
    console.log("🧹 Cleaning existing data...")
    
    // Clear existing data
    await User.deleteMany({ email: { $in: seedEmails } })
    await Skill.deleteMany({})
    await Project.deleteMany({})
    await Certification.deleteMany({})
    
    console.log("👥 Creating students...")
    const students = createStudents()
    const users = await User.insertMany(students)
    
    console.log("📚 Creating skills, projects, and certifications...")
    
    const skills = []
    const projects = []
    const certifications_data = []
    
    for(let i = 0; i < users.length; i++) {
      const user = users[i]
      
      // Determine student's primary specialization
      const categoryWeights = {
        frontend: 0.2, backend: 0.2, programming: 0.15, database: 0.1,
        ai: 0.15, devops: 0.1, mobile: 0.05, testing: 0.03, cloud: 0.02
      }
      
      // Pick specialization based on academic year and CGPA
      let primaryCategory
      if(user.cgpa > 8.0 && user.academicYear > 2) {
        // High performers in later years tend to specialize in AI/Cloud/DevOps
        const advancedCats = ["ai", "devops", "cloud", "backend"]
        primaryCategory = advancedCats[Math.floor(Math.random() * advancedCats.length)]
      } else if(user.academicYear < 3) {
        // Junior students stick to basics
        const basicCats = ["programming", "frontend", "database"]
        primaryCategory = basicCats[Math.floor(Math.random() * basicCats.length)]
      } else {
        // Others have varied specializations
        const categories = Object.keys(skillGroups)
        primaryCategory = categories[Math.floor(Math.random() * categories.length)]
      }
      
      // Generate skills
      const primarySkills = pickRandomWeighted(skillGroups[primaryCategory].skills, 
        user.academicYear > 2 ? 4 : 2)
      
      // Add secondary skills from other categories
      const otherCategories = Object.keys(skillGroups).filter(c => c !== primaryCategory)
      const secondaryCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)]
      const secondarySkills = pickRandomWeighted(skillGroups[secondaryCategory].skills, 2)
      
      const allSkills = [...primarySkills, ...secondarySkills]
      
      // Create skills with appropriate levels
      allSkills.forEach(skillName => {
        let level
        if(primarySkills.includes(skillName)) {
          // Primary skills are more advanced
          level = user.academicYear > 2 ? 
            ["Intermediate", "Advanced", "Expert"][Math.floor(Math.random() * 3)] :
            ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)]
        } else {
          // Secondary skills are beginner to intermediate
          level = ["Beginner", "Intermediate"][Math.floor(Math.random() * 2)]
        }
        
        skills.push({
          student: user._id,
          name: skillName,
          category: primarySkills.includes(skillName) ? primaryCategory : secondaryCategory,
          level,
          experience: user.academicYear > 2 ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 2),
          verified: Math.random() > 0.7 // Some skills are verified through tests
        })
      })
      
      // Generate projects
      const projectCount = user.academicYear === 1 ? 1 :
                          user.academicYear === 2 ? 2 :
                          user.academicYear === 3 ? 3 : 4
      
      for(let p = 0; p < projectCount; p++) {
        const category = Object.keys(projectTemplates)[Math.floor(Math.random() * Object.keys(projectTemplates).length)]
        const template = projectTemplates[category][Math.floor(Math.random() * projectTemplates[category].length)]
        
        // Pick relevant tech stack
        const techs = []
        const techCategory = Object.keys(techStacks)[Math.floor(Math.random() * Object.keys(techStacks).length)]
        for(let t = 0; t < 3; t++) {
          const tech = techStacks[techCategory][Math.floor(Math.random() * techStacks[techCategory].length)]
          if(!techs.includes(tech)) techs.push(tech)
        }
        
        const isTeamProject = Math.random() > 0.4
        const teamSize = isTeamProject ? Math.floor(Math.random() * 3) + 2 : 1
        
        projects.push({
          student: user._id,
          title: `${template} ${p+1}`,
          description: generateProjectDescription(techs),
          tech: techs,
          github: `https://github.com/student${i+1}/project${p+1}`,
          liveDemo: Math.random() > 0.5 ? `https://project${p+1}.vercel.app` : null,
          status: Math.random() > 0.2 ? "Completed" : "In Progress",
          startDate: new Date(2023, Math.floor(Math.random() * 12), 1),
          endDate: Math.random() > 0.3 ? new Date(2024, Math.floor(Math.random() * 12), 1) : null,
          teamProject: isTeamProject,
          teamSize,
          stars: Math.floor(Math.random() * 50),
          forks: Math.floor(Math.random() * 20),
          category
        })
      }
      
      // Generate certifications
      const certCount = user.academicYear === 1 ? Math.floor(Math.random() * 2) :
                       user.academicYear === 2 ? Math.floor(Math.random() * 3) :
                       user.academicYear === 3 ? Math.floor(Math.random() * 4) :
                       Math.floor(Math.random() * 5)
      
      for(let c = 0; c < certCount; c++) {
        const cert = certifications[Math.floor(Math.random() * certifications.length)]
        const issueDate = new Date(2024, Math.floor(Math.random() * 12), 1)
        const expiryDate = cert.category === "Cloud" || cert.category === "Security" ? 
          new Date(2027, Math.floor(Math.random() * 12), 1) : null
        
        certifications_data.push({
          student: user._id,
          name: cert.name,
          issuer: cert.issuer,
          issueDate,
          expiryDate,
          credentialId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          credentialUrl: Math.random() > 0.3 ? `https://credential.com/${Math.random().toString(36)}` : null,
          category: cert.category,
          verified: Math.random() > 0.2 // Most certifications are verified
        })
      }
      
      // Log progress every 100 students
      if((i + 1) % 100 === 0) {
        console.log(`  Processed ${i + 1}/${users.length} students`)
      }
    }
    
    console.log("💾 Saving skills...")
    await Skill.insertMany(skills)
    
    console.log("💾 Saving projects...")
    await Project.insertMany(projects)
    
    console.log("💾 Saving certifications...")
    await Certification.insertMany(certifications_data)
    
    // Generate statistics for verification
    console.log("\n📊 SEED DATA SUMMARY")
    console.log("===================")
    console.log(`✅ Students: ${users.length}`)
    console.log(`✅ Skills: ${skills.length} (Avg: ${(skills.length/users.length).toFixed(1)} per student)`)
    console.log(`✅ Projects: ${projects.length} (Avg: ${(projects.length/users.length).toFixed(1)} per student)`)
    console.log(`✅ Certifications: ${certifications_data.length} (Avg: ${(certifications_data.length/users.length).toFixed(1)} per student)`)
    
    // Achievement distribution
    const achievementCounts = {}
    users.forEach(u => {
      achievementCounts[u.achievement] = (achievementCounts[u.achievement] || 0) + 1
    })
    console.log("\n📈 Achievement Distribution:")
    Object.keys(achievementCounts).forEach(key => {
      console.log(`  ${key}: ${achievementCounts[key]} (${((achievementCounts[key]/users.length)*100).toFixed(1)}%)`)
    })
    
    // Placement stats
    const placed = users.filter(u => u.placementStatus === "Placed").length
    console.log(`\n💼 Placement: ${placed} students placed (${((placed/users.length)*100).toFixed(1)}%)`)
    
    console.log("\n✅ Seeding completed successfully!")
    
    process.exit()
    
  } catch(err) {
    console.error("❌ Error:", err)
    process.exit(1)
  }
}

// --------------------
// DELETE DATA
// --------------------
const destroyData = async () => {
  try {
    console.log("🗑  Removing seed data...")
    
    const users = await User.find({ email: { $in: seedEmails } })
    const ids = users.map(u => u._id)
    
    await Skill.deleteMany({ student: { $in: ids } })
    await Project.deleteMany({ student: { $in: ids } })
    await Certification.deleteMany({ student: { $in: ids } })
    await User.deleteMany({ _id: { $in: ids } })
    
    console.log(`✅ Removed ${users.length} students and related data`)
    process.exit()
    
  } catch(err) {
    console.error("❌ Error:", err)
    process.exit(1)
  }
}

// --------------------
// MAIN
// --------------------
if(process.argv[2] === "-d") {
  destroyData()
} else {
  console.log("🌱 Starting seed process...")
  importData()
}