const Student = require('../models/Student');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async.middleware');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Register a new student
 * @route   POST /api/students
 * @access  Private (Admin)
 */
exports.registerStudent = asyncHandler(async (req, res, next) => {
  // Handle file upload if there's a profile image
  if (req.file) {
    req.body.profileImage = {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    };
  }

  // Create student
  const student = await Student.create(req.body);

  res.status(201).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Get all students with pagination and filtering
 * @route   GET /api/students
 * @access  Private (Admin, Teacher)
 */
exports.getStudents = asyncHandler(async (req, res, next) => {
  // Extract query params
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
    classYear,
    classCode,
    ageGroup
  } = req.query;

  // Build query
  const query = {};

  // Add search filter (search by name or student ID)
  if (search) {
    query.$or = [
      { 'name.en': { $regex: search, $options: 'i' } },
      { 'name.si': { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } }
    ];
  }

  // Add filters if provided
  if (classYear) query.classYear = classYear;
  if (classCode) query.classCode = classCode;
  if (ageGroup) query.ageGroup = ageGroup;

  // Count total documents
  const totalItems = await Student.countDocuments(query);

  // Execute query with pagination
  const students = await Student.find(query)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: students,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * @desc    Get a single student by ID
 * @route   GET /api/students/:id
 * @access  Private
 */
exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (Admin)
 */
exports.updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Handle file upload if there's a profile image
  if (req.file) {
    // Delete old image if exists
    if (student.profileImage && student.profileImage.filename) {
      const oldImagePath = path.join(__dirname, '../public/uploads', student.profileImage.filename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Set new image
    req.body.profileImage = {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    };
  }

  // Handle image removal if requested
  if (req.body.removeProfileImage === 'true' && !req.file) {
    if (student.profileImage && student.profileImage.filename) {
      const oldImagePath = path.join(__dirname, '../public/uploads', student.profileImage.filename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    req.body.profileImage = null;
  }

  // Update student
  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (Admin)
 */
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Delete profile image if exists
  if (student.profileImage && student.profileImage.filename) {
    const imagePath = path.join(__dirname, '../public/uploads', student.profileImage.filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await Student.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});
