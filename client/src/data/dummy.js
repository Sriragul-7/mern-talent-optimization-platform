export const dummyStudent = {
  id: 1,
  name: "Arjun Kumar",
  email: "arjun@university.edu",
  age: 21,
  university: "Anna University",
  department: "Computer Science",
  cgpa: 8.7,
  github: "https://github.com/arjunkumar",
  linkedin: "https://linkedin.com/in/arjunkumar",
  profileScore: 78,
}

export const dummyEmployer = {
  id: 1,
  name: "Meera Nair",
  email: "meera@techcorp.com",
  company: "TechCorp Solutions",
  website: "https://techcorp.com",
  industry: "Software Development",
  size: "51-200",
}

export const dummySkills = [
  { id: 1, name: "React", category: "Frontend", level: "Pro", dateAdded: "2024-01-15" },
  { id: 2, name: "Node.js", category: "Backend", level: "Intermediate", dateAdded: "2024-02-10" },
  { id: 3, name: "Python", category: "Backend", level: "Intermediate", dateAdded: "2024-03-01" },
  { id: 4, name: "MongoDB", category: "Database", level: "Beginner", dateAdded: "2024-03-15" },
  { id: 5, name: "Docker", category: "Tools", level: "Beginner", dateAdded: "2024-04-01" },
  { id: 6, name: "TypeScript", category: "Frontend", level: "Intermediate", dateAdded: "2024-04-20" },
]

export const dummyProjects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Full stack e-commerce app with cart, payments, and admin dashboard. Handles real-time inventory updates.",
    stack: ["React", "Node.js", "MongoDB", "Stripe"],
    startDate: "2024-01-01",
    endDate: "2024-03-01",
    teamMembers: ["Arjun Kumar", "Priya Singh", "Rahul Mehta"],
    github: "https://github.com/arjunkumar/ecommerce",
  },
  {
    id: 2,
    name: "AI Study Assistant",
    description: "Chatbot for students using OpenAI API to answer subject-specific questions with context retention.",
    stack: ["Python", "FastAPI", "OpenAI", "React"],
    startDate: "2024-03-15",
    endDate: "2024-05-01",
    teamMembers: ["Arjun Kumar", "Neha Patel"],
    github: "https://github.com/arjunkumar/ai-study",
  },
]

export const dummyCertifications = [
  { id: 1, name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "2024-02-15", credentialId: "AWS-123456", url: "#" },
  { id: 2, name: "React Developer Certificate", issuer: "Meta", date: "2023-11-01", credentialId: "META-789", url: "#" },
]

export const dummyAchievements = [
  { id: 1, title: "Smart India Hackathon Winner", description: "Won 1st place in SIH 2023 national finals", date: "2023-12-10" },
  { id: 2, title: "Dean's List", description: "Achieved top 5% CGPA in department", date: "2024-01-15" },
]

export const dummyEvents = [
  { id: 1, name: "Google DevFest 2023", role: "Participant", date: "2023-11-20", location: "Chennai" },
  { id: 2, name: "HackNITR 4.0", role: "Winner", date: "2024-02-05", location: "NIT Rourkela" },
]

export const dummySearchResults = [
  {
    id: 1, name: "Priya Singh", university: "IIT Madras", department: "CS", cgpa: 9.2,
    skills: [{ name: "Python", level: "Pro" }, { name: "ML", level: "Pro" }, { name: "React", level: "Intermediate" }],
    certifications: 4, profileScore: 92,
  },
  {
    id: 2, name: "Rahul Mehta", university: "NIT Trichy", department: "IT", cgpa: 8.9,
    skills: [{ name: "React", level: "Pro" }, { name: "Node.js", level: "Pro" }, { name: "AWS", level: "Intermediate" }],
    certifications: 3, profileScore: 88,
  },
  {
    id: 3, name: "Arjun Kumar", university: "Anna University", department: "CS", cgpa: 8.7,
    skills: [{ name: "React", level: "Pro" }, { name: "Python", level: "Intermediate" }, { name: "Docker", level: "Beginner" }],
    certifications: 2, profileScore: 78,
  },
  {
    id: 4, name: "Neha Patel", university: "VIT Vellore", department: "CS", cgpa: 8.5,
    skills: [{ name: "Java", level: "Pro" }, { name: "Spring Boot", level: "Intermediate" }, { name: "SQL", level: "Pro" }],
    certifications: 2, profileScore: 74,
  },
]

export const dummyRecommendedSkills = [
  { name: "TypeScript", reason: "Complements your React Pro skill" },
  { name: "AWS", reason: "High demand with your backend skills" },
  { name: "GraphQL", reason: "Popular with React + Node.js stack" },
  { name: "Redis", reason: "Pairs well with your MongoDB experience" },
]

export const dummyRecommendedProjects = [
  { title: "Real-time Chat App", description: "Build a WebSocket chat with rooms and authentication", stack: ["React", "Socket.io", "Node.js"] },
  { title: "DevOps Pipeline", description: "CI/CD pipeline with Docker and GitHub Actions", stack: ["Docker", "GitHub Actions", "AWS"] },
  { title: "Portfolio Analytics", description: "Dashboard to track GitHub activity and contributions", stack: ["React", "Python", "GitHub API"] },
]