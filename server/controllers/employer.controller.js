const Employer = require('../models/Employer');
const Student = require('../models/Student');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');

exports.getEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.userId });
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    res.json(employer);
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(employer);
  } catch (error) {
    console.error('Update employer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchStudents = async (req, res) => {
  try {
    const { skills, certifications, minProjects, minCGPA, level, search } = req.query;
    
    let query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by CGPA
    if (minCGPA) {
      query.cgpa = { $gte: parseFloat(minCGPA) };
    }

    // Filter by level
    if (level) {
      query.level = level;
    }

    // Filter by min projects
    if (minProjects) {
      query.totalProjects = { $gte: parseInt(minProjects) };
    }

    // Get students
    let students = await Student.find(query);

    // Filter by skills if provided
    if (skills) {
      const skillList = skills.split(',');
      const studentIds = await Skill.distinct('studentId', {
        name: { $in: skillList }
      });
      students = students.filter(s => studentIds.includes(s._id.toString()));
    }

    // Filter by certifications if provided
    if (certifications) {
      const certList = certifications.split(',');
      const studentIds = await Certification.distinct('studentId', {
        name: { $in: certList }
      });
      students = students.filter(s => studentIds.includes(s._id.toString()));
    }

    // Calculate match score for each student
    const scoredStudents = await Promise.all(students.map(async (student) => {
      let score = 0;
      
      // Skill match score
      if (skills) {
        const studentSkills = await Skill.find({ studentId: student._id });
        const requiredSkills = skills.split(',');
        const matchedSkills = studentSkills.filter(s => 
          requiredSkills.includes(s.name)
        );
        score += (matchedSkills.length / requiredSkills.length) * 50;
      }

      // Certification match score
      if (certifications) {
        const studentCerts = await Certification.find({ studentId: student._id });
        const requiredCerts = certifications.split(',');
        const matchedCerts = studentCerts.filter(c => 
          requiredCerts.includes(c.name)
        );
        score += (matchedCerts.length / requiredCerts.length) * 30;
      }

      // Project count score
      if (minProjects) {
        const projectScore = Math.min(student.totalProjects / parseInt(minProjects), 1) * 20;
        score += projectScore;
      }

      return {
        ...student.toObject(),
        matchScore: Math.round(score)
      };
    }));

    // Sort by match score
    scoredStudents.sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredStudents);
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const skills = await Skill.find({ studentId });
    const projects = await Project.find({ studentId });
    const certifications = await Certification.find({ studentId });
    const achievements = await Achievement.find({ studentId });

    res.json({
      student,
      skills,
      projects,
      certifications,
      achievements
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};