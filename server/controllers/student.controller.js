const Student = require('../models/Student');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const skills = await Skill.find({ studentId: student._id });
    const projects = await Project.find({ studentId: student._id });
    const certifications = await Certification.find({ studentId: student._id });
    const achievements = await Achievement.find({ studentId: student._id });

    res.json({
      student,
      skills,
      projects,
      certifications,
      achievements
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(student);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addSkill = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const skill = new Skill({
      ...req.body,
      studentId: student._id
    });
    await skill.save();

    // Update student level based on skills
    await updateStudentLevel(student._id);

    res.status(201).json(skill);
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSkills = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const skills = await Skill.find({ studentId: student._id });
    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addProject = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const project = new Project({
      ...req.body,
      studentId: student._id
    });
    await project.save();

    // Update total projects count
    await Student.findByIdAndUpdate(student._id, {
      $inc: { totalProjects: 1, points: 50 }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const projects = await Project.find({ studentId: student._id });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addCertification = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const certification = new Certification({
      ...req.body,
      studentId: student._id
    });
    await certification.save();

    // Update total certifications count
    await Student.findByIdAndUpdate(student._id, {
      $inc: { totalCertifications: 1, points: 30 }
    });

    res.status(201).json(certification);
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCertifications = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const certifications = await Certification.find({ studentId: student._id });
    res.json(certifications);
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addAchievement = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const achievement = new Achievement({
      ...req.body,
      studentId: student._id
    });
    await achievement.save();

    // Update points
    await Student.findByIdAndUpdate(student._id, {
      $inc: { points: 20 }
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAchievements = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    const achievements = await Achievement.find({ studentId: student._id });
    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update student level
async function updateStudentLevel(studentId) {
  const skills = await Skill.find({ studentId });
  const totalSkills = skills.length;
  const proSkills = skills.filter(s => s.level === 'Pro').length;
  const intermediateSkills = skills.filter(s => s.level === 'Intermediate').length;

  let level = 'Beginner';
  if (proSkills >= 5 || (proSkills >= 3 && intermediateSkills >= 5)) {
    level = 'Pro';
  } else if (proSkills >= 2 || intermediateSkills >= 5) {
    level = 'Intermediate';
  }

  await Student.findByIdAndUpdate(studentId, { level });
}