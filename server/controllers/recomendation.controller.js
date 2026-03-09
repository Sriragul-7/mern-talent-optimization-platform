const Student = require('../models/Student');
const Skill = require('../models/Skill');
const Project = require('../models/Project');

exports.getSkillRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const currentSkills = await Skill.find({ studentId: student._id });
    
    // Get skill recommendations based on:
    // 1. Trending skills in similar projects
    // 2. Skills commonly paired with existing skills
    // 3. Skills needed for next level
    
    const recommendations = [];
    
    // Find skills from projects in similar domains
    const projectDomains = currentSkills.map(s => s.category);
    const similarProjects = await Project.find({
      technologies: { $in: currentSkills.map(s => s.name) }
    }).limit(20);
    
    const recommendedTech = new Set();
    similarProjects.forEach(project => {
      project.technologies.forEach(tech => {
        if (!currentSkills.some(s => s.name === tech)) {
          recommendedTech.add(tech);
        }
      });
    });

    Array.from(recommendedTech).slice(0, 10).forEach(tech => {
      recommendations.push({
        name: tech,
        reason: 'Commonly used in projects similar to yours',
        demand: 'High'
      });
    });

    // Level-based recommendations
    if (student.level === 'Beginner') {
      recommendations.push({
        name: 'Advanced JavaScript',
        reason: 'Next step to reach Intermediate level',
        demand: 'Essential'
      });
    } else if (student.level === 'Intermediate') {
      recommendations.push({
        name: 'System Design',
        reason: 'Crucial for Pro level developers',
        demand: 'High'
      });
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Get skill recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProjectRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const currentSkills = await Skill.find({ studentId: student._id });
    const currentProjects = await Project.find({ studentId: student._id });

    const recommendations = [];

    // Recommend projects based on missing skills
    const skillNames = currentSkills.map(s => s.name);
    
    // Popular project templates
    const projectTemplates = [
      {
        name: 'E-commerce Platform',
        technologies: ['React', 'Node.js', 'MongoDB', 'Redux'],
        difficulty: 'Intermediate',
        reason: 'Great for full-stack experience'
      },
      {
        name: 'Task Management App',
        technologies: ['Vue.js', 'Express', 'PostgreSQL', 'Socket.io'],
        difficulty: 'Beginner',
        reason: 'Perfect for learning real-time features'
      },
      {
        name: 'AI Content Generator',
        technologies: ['Python', 'TensorFlow', 'FastAPI', 'React'],
        difficulty: 'Advanced',
        reason: 'Trending technology stack'
      },
      {
        name: 'Portfolio with Blog',
        technologies: ['Next.js', 'MDX', 'TailwindCSS', 'Vercel'],
        difficulty: 'Beginner',
        reason: 'Showcase your work and writing skills'
      },
      {
        name: 'Analytics Dashboard',
        technologies: ['D3.js', 'React', 'Node.js', 'WebSocket'],
        difficulty: 'Intermediate',
        reason: 'Master data visualization'
      }
    ];

    projectTemplates.forEach(template => {
      const missingTech = template.technologies.filter(t => !skillNames.includes(t));
      if (missingTech.length > 0) {
        recommendations.push({
          ...template,
          missingTechnologies: missingTech,
          learnWhileBuilding: missingTech.join(', ')
        });
      }
    });

    res.json(recommendations.slice(0, 5));
  } catch (error) {
    console.error('Get project recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};