const Student = require('../models/student.model');
const User = require('../models/user.model');
const Attendance = require('../models/attendance.model'); // Import Attendance model
const fs = require('fs');
const path = require('path');

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
      parentInfo
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

    // Add profile image if available
    let profileImage = null;
    if (req.file) {
      // Create URL path to the uploaded file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      profileImage = {
        public_id: req.file.filename,
        url: `${baseUrl}/uploads/students/${req.file.filename}`
      };
    }

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
    console.error("Error registering student:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create student
// @route   POST /api/students/create
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const studentData = req.body;
    
    // Handle file upload - add profile image URL if file was uploaded
    if (req.file) {
      // Create URL path to the uploaded file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      studentData.profileImageUrl = `${baseUrl}/uploads/students/${req.file.filename}`;
    }
    
    // Continue with the student creation logic...
    // ...
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: createdStudent
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to register student'
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

    // Check if student has attendance records
    const attendanceRecords = await Attendance.find({ 'students.studentId': student.studentId });
    
    // Delete profile image file if exists
    if (student.profileImage && student.profileImage.public_id) {
      const imagePath = path.join(__dirname, '../public/uploads/students', student.profileImage.public_id);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Update attendance records if they exist
    if (attendanceRecords.length > 0) {
      await Attendance.updateMany(
        { 'students.studentId': student.studentId },
        { $pull: { students: { studentId: student.studentId } } }
      );
    }
    
    // Delete the student - using deleteOne() instead of remove() which is deprecated
    await Student.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};