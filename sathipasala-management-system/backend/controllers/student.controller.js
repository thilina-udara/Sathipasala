const { uploadStudentPhoto, deleteFromCloudinary } = require('../config/cloudinary');
const Student = require('../models/Student');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async.middleware');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

/**
 * @desc    Register a new student with Cloudinary image
 * @route   POST /api/students  
 * @access  Private (Admin)
 */
exports.registerStudent = asyncHandler(async (req, res, next) => {
  console.log('Registering new student:', req.body);

  try {
    // Create student - the ID will be generated in the pre-save hook
    const student = await Student.create(req.body);

    // Log the generated ID
    console.log(`Student created with ID: ${student.studentId}`);

    res.status(201).json({
      success: true,
      data: student,
      message: 'Student registered successfully'
    });
  } catch (error) {
    console.error('Error registering student:', error);
    return next(new ErrorResponse(`Failed to register student: ${error.message}`, 500));
  }
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
 * @desc    Update student with Cloudinary image handling
 * @route   PUT /api/students/:id
 * @access  Private (Admin)
 */
exports.updateStudent = asyncHandler(async (req, res, next) => {
  console.log('Updating student ID:', req.params.id);
  console.log('Update data received:', JSON.stringify(req.body));
  
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    // Normalize the data to match schema requirements
    const updateData = { ...req.body };
    
    // Normalize gender (capitalize first letter)
    if (updateData.gender) {
      const normalizedGender = updateData.gender.charAt(0).toUpperCase() + 
                             updateData.gender.slice(1).toLowerCase();
                             
      console.log(`Normalizing gender from "${updateData.gender}" to "${normalizedGender}"`);
      updateData.gender = normalizedGender;
    }

    // Handle Cloudinary image updates
    if (updateData.profileImage) {
      console.log('Profile image data received:', updateData.profileImage);
      
      // Make sure we have a proper URL
      if (!updateData.profileImage.url && updateData.profileImage.path) {
        updateData.profileImage.url = updateData.profileImage.path;
      }
      
      // If we don't have a URL but have a filename that looks like a URL
      if (!updateData.profileImage.url && updateData.profileImage.filename && 
          (updateData.profileImage.filename.startsWith('http://') || 
           updateData.profileImage.filename.startsWith('https://'))) {
        updateData.profileImage.url = updateData.profileImage.filename;
      }
      
      // Ensure we have required fields
      if (!updateData.profileImage.url) {
        console.warn('Missing URL in profileImage:', updateData.profileImage);
        return next(new ErrorResponse('Missing image URL in the request', 400));
      }
      
      // Delete old image from Cloudinary if exists
      if (student.profileImage?.public_id) {
        try {
          await deleteFromCloudinary(student.profileImage.public_id);
          console.log('Old image deleted from Cloudinary');
        } catch (error) {
          console.warn('Failed to delete old image from Cloudinary:', error);
        }
      }
    }

    console.log('Final update data after normalization:', updateData);
    
    student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Student update error:', error);
    return next(new ErrorResponse(`Failed to update student: ${error.message}`, 500));
  }
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

// Replace your existing uploadProfileImage function
exports.uploadProfileImage = async (req, res) => {
  try {
    // Handle multer upload
    uploadStudentPhoto.single('profileImage')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }

      const { id } = req.params;

      // Find student
      const student = await Student.findById(id);
      if (!student) {
        // Clean up uploaded file if student not found
        if (req.file?.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Delete old image if exists
      if (student.profileImage?.public_id) {
        try {
          await deleteFromCloudinary(student.profileImage.public_id);
        } catch (deleteError) {
          console.warn('Failed to delete old image:', deleteError);
        }
      }

      // Update student with new Cloudinary image data
      const imageData = {
        url: req.file.secure_url,
        public_id: req.file.public_id,
        filename: req.file.original_filename || req.file.originalname,
        uploadedAt: new Date()
      };

      student.profileImage = imageData;
      await student.save();

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          student: {
            _id: student._id,
            profileImage: imageData
          }
        }
      });
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file?.public_id) {
      try {
        await deleteFromCloudinary(req.file.public_id);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image'
    });
  }
};

// Enhanced delete function
exports.deleteProfileImage = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!student.profileImage?.public_id) {
      return res.status(400).json({
        success: false,
        message: 'No profile image to delete'
      });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(student.profileImage.public_id);

    // Update student record
    student.profileImage = null;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully',
      data: { student: { _id: student._id, profileImage: null } }
    });

  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete profile image'
    });
  }
};
