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

  // Debug info for filtering
  console.log('Student filtering query:', JSON.stringify(query));

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
  console.log('Update student called for ID:', req.params.id);
  console.log('File in request:', req.file ? 'YES' : 'NO');
  if (req.file) {
    console.log('File details:', req.file.filename, req.file.mimetype, req.file.size);
  }
  
  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Handle file upload if there's a profile image
  if (req.file) {
    console.log('Processing new image upload');
    
    // Delete old image if exists
    try {
      if (student.profileImage && student.profileImage.filename) {
        const oldImagePath = path.join(__dirname, '../public/uploads', student.profileImage.filename);
        console.log('Looking for old image at:', oldImagePath);
        
        if (fs.existsSync(oldImagePath)) {
          console.log('Deleting old image file');
          fs.unlinkSync(oldImagePath);
        } else {
          console.log('Old image file not found on disk');
        }
      }
      
      // Set new image - use absolute URL for stability
      const filename = req.file.filename;
      req.body.profileImage = {
        url: `/uploads/${filename}`,
        filename: filename
      };
      
      console.log('New profile image data:', req.body.profileImage);
    } catch (err) {
      console.error('Error processing file:', err);
      // Continue with the update even if there was an error with the old file
    }
  }

  // Handle image removal if requested
  if (req.body.removeProfileImage === 'true' && !req.file) {
    console.log('Image removal requested');
    try {
      if (student.profileImage && student.profileImage.filename) {
        const oldImagePath = path.join(__dirname, '../public/uploads', student.profileImage.filename);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Removed old image file');
        }
      }
      req.body.profileImage = null;
      console.log('Set profileImage to null in database');
    } catch (err) {
      console.error('Error removing image:', err);
    }
  }

  // Update student with updated fields only
  console.log('Fields being updated:', Object.keys(req.body));
  
  // Make sure profileImage is properly handled (MongoDB can be picky about null fields)
  if (req.body.profileImage === null) {
    // Use $unset to completely remove the field
    await Student.updateOne(
      { _id: req.params.id }, 
      { $unset: { profileImage: "" } }
    );
    delete req.body.profileImage; // Don't include it in the main update
  }

  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  console.log('Student updated successfully');
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

/**
 * @desc    Get class groups statistics
 * @route   GET /api/students/classes
 * @access  Private (Admin, Teacher)
 */
exports.getClassGroups = asyncHandler(async (req, res, next) => {
  console.log('Class groups controller function called');
  
  try {
    // Aggregate students by class
    const classCounts = await Student.aggregate([
      {
        $group: {
          _id: {
            classCode: "$classCode",
            classYear: "$classYear"
          },
          count: { $sum: 1 },
          ageGroups: { $addToSet: "$ageGroup" }
        }
      },
      {
        $sort: {
          "_id.classYear": -1,
          "_id.classCode": 1
        }
      }
    ]);
    
    // Class information with color coding and display names
    const classInfo = {
      'ADH': { name: 'Adhiṭṭhāna', nameSi: 'අධිඨාන', color: 'white', colorClass: 'bg-white text-gray-900 border-gray-200' },
      'MET': { name: 'Mettā', nameSi: 'මෙත්තා', color: 'orange', colorClass: 'bg-orange-100 text-orange-900' },
      'KHA': { name: 'Khanti', nameSi: 'ඛන්ති', color: 'yellow', colorClass: 'bg-yellow-100 text-yellow-900' },
      'NEK': { name: 'Nekkhamma', nameSi: 'නෙක්කම්ම', color: 'blue', colorClass: 'bg-blue-100 text-blue-900' }
    };
    
    // Format response with class information
    const response = classCounts.map(group => ({
      classCode: group._id.classCode,
      classYear: group._id.classYear,
      count: group.count,
      ageGroups: group.ageGroups,
      ...classInfo[group._id.classCode]
    }));
    
    console.log(`Returning class data: ${response.length} classes found`);
    
    // Return the class grouping
    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in getClassGroups:', error);
    return next(new ErrorResponse('Failed to retrieve class data', 500));
  }
});
