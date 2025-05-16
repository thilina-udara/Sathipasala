const Student = require('../models/student.model');
const User = require('../models/user.model');

// Helper function to generate student ID
const generateStudentId = async (yearOfAdmission, classCode) => {
  const prefix = `SATHI-${yearOfAdmission}-${classCode}-`;
  
  // Find the highest sequence number for this combination
  const lastStudent = await Student.findOne({
    studentId: { $regex: `^${prefix}` }
  }).sort({ studentId: -1 });
  
  let sequenceNumber = 1;
  if (lastStudent) {
    // Extract the sequence number from the last student ID
    const lastSequence = parseInt(lastStudent.studentId.split('-').pop());
    sequenceNumber = lastSequence + 1;
  }
  
  // Pad sequence number with leading zeros
  const paddedSeq = String(sequenceNumber).padStart(3, '0');
  return `${prefix}${paddedSeq}`;
};

// @desc    Register a new student
// @route   POST /api/students
// @access  Private/Admin
exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      dateOfBirth,
      ageGroup,
      classYear,
      classCode,
      parentInfo,
      profileImage
    } = req.body;

    // Check if student with same name and DOB exists
    const existingStudent = await Student.findOne({
      'name.en': name.en,
      dateOfBirth: new Date(dateOfBirth)
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with the same name and date of birth already exists'
      });
    }

    // Generate student ID
    const studentId = await generateStudentId(
      new Date(dateOfBirth).getFullYear(),
      classCode
    );

    // Create student
    const student = await Student.create({
      studentId,
      name,
      dateOfBirth,
      ageGroup,
      classYear,
      classCode,
      parentInfo,
      profileImage
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin,Teacher
exports.getStudents = async (req, res) => {
  try {
    // Allow filtering by ageGroup, classYear, etc.
    let query = {};
    
    if (req.query.ageGroup) {
      query.ageGroup = req.query.ageGroup;
    }
    
    if (req.query.classYear) {
      query.classYear = req.query.classYear;
    }
    
    if (req.query.classCode) {
      query.classCode = req.query.classCode;
    }

    const students = await Student.find(query);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};