const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async.middleware');
const mongoose = require('mongoose');

/**
 * @desc    Get attendance records by date and optional classCode
 * @route   GET /api/attendance/date/:date
 * @access  Private
 */
exports.getAttendanceByDate = asyncHandler(async (req, res, next) => {
  const { date } = req.params;
  const { classCode } = req.query;
  
  console.log(`Fetching attendance for date ${date} and class ${classCode || 'all'}`);
  
  // Convert date string to Date object for MongoDB query
  const queryDate = new Date(date);
  // Set time to beginning of day
  queryDate.setUTCHours(0, 0, 0, 0);
  
  // Create end date (next day)
  const endDate = new Date(queryDate);
  endDate.setUTCHours(23, 59, 59, 999);
  
  let query = { 
    date: { 
      $gte: queryDate, 
      $lt: endDate 
    } 
  };
  
  // If classCode is provided, filter by students in that class
  if (classCode) {
    // First find students with this class code
    const students = await Student.find({ classCode }).select('_id');
    const studentIds = students.map(s => s._id);
    
    if (studentIds.length > 0) {
      query.student = { $in: studentIds };
    } else {
      // No students in this class, return empty result
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  }
  
  console.log('Attendance query:', JSON.stringify(query));
  
  // Find attendance records
  const attendanceRecords = await Attendance.find(query).populate({
    path: 'student',
    select: 'name studentId classCode profileImage'
  });
  
  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords
  });
});

/**
 * @desc    Mark attendance for a single student
 * @route   POST /api/attendance
 * @access  Private
 */
exports.markAttendance = asyncHandler(async (req, res, next) => {
  console.log('Marking attendance for single student:', req.body);
  
  const { student, date, status, broughtFlowers, notes } = req.body;
  
  // Check if student exists
  const studentExists = await Student.findById(student);
  if (!studentExists) {
    return next(new ErrorResponse(`Student with ID ${student} not found`, 404));
  }
  
  // Try to find existing attendance record first
  let attendance = await Attendance.findOne({
    student,
    date: new Date(date)
  });
  
  if (attendance) {
    // Update existing record
    attendance = await Attendance.findByIdAndUpdate(
      attendance._id,
      { status, broughtFlowers, notes },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: attendance,
      message: 'Attendance record updated'
    });
  }
  
  // Create new record
  attendance = await Attendance.create({
    student,
    date,
    status: status || 'present',
    broughtFlowers: broughtFlowers || false,
    notes: notes || ''
  });
  
  res.status(201).json({
    success: true,
    data: attendance,
    message: 'New attendance record created'
  });
});

/**
 * @desc    Mark attendance for multiple students in a batch
 * @route   POST /api/attendance/batch
 * @access  Private
 */
exports.markBatchAttendance = asyncHandler(async (req, res, next) => {
  try {
    console.log('Processing batch attendance request');
    const { attendance } = req.body;
    
    if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
      return next(new ErrorResponse('Please provide attendance data as an array', 400));
    }
    
    console.log(`Processing batch attendance for ${attendance.length} students`);
    
    // Process each record individually, which is more reliable
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
    
    for (const record of attendance) {
      try {
        // Validate each record
        if (!record.student || !mongoose.Types.ObjectId.isValid(record.student)) {
          results.failed++;
          results.errors.push(`Invalid student ID: ${record.student}`);
          continue;
        }
        
        if (!record.date) {
          results.failed++;
          results.errors.push('Missing date');
          continue;
        }
        
        // Normalize date to midnight UTC
        const normalizedDate = new Date(record.date);
        normalizedDate.setUTCHours(0, 0, 0, 0);
        
        // Check if record already exists for this student and date
        const existingAttendance = await Attendance.findOne({
          student: record.student,
          date: normalizedDate
        });
        
        if (existingAttendance) {
          // Update existing record
          await Attendance.updateOne(
            { _id: existingAttendance._id },
            { 
              $set: {
                status: record.status || existingAttendance.status,
                broughtFlowers: record.broughtFlowers !== undefined ? record.broughtFlowers : existingAttendance.broughtFlowers,
                notes: record.notes || existingAttendance.notes,
                updatedAt: new Date()
              }
            }
          );
          results.updated++;
          console.log(`Updated attendance for student ${record.student}`);
        } else {
          // Create new record
          await Attendance.create({
            student: record.student,
            date: normalizedDate,
            status: record.status || 'present',
            broughtFlowers: record.broughtFlowers || false,
            notes: record.notes || ''
          });
          results.created++;
          console.log(`Created attendance for student ${record.student}`);
        }
      } catch (error) {
        console.error('Error processing attendance record:', error);
        results.failed++;
        results.errors.push(`Error with student ${record.student}: ${error.message}`);
      }
    }
    
    console.log(`Attendance processing complete: ${results.created} created, ${results.updated} updated, ${results.failed} failed`);
    
    res.status(200).json({
      success: true,
      message: `Successfully processed attendance: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
      data: results
    });
    
  } catch (error) {
    console.error('Error in batch attendance:', error);
    return next(new ErrorResponse(`Failed to process attendance: ${error.message}`, 500));
  }
});

/**
 * @desc    Get attendance by student ID
 * @route   GET /api/attendance/student/:id
 * @access  Private
 */
exports.getStudentAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Get date range if provided in query
  const { startDate, endDate } = req.query;
  
  // Check if student exists
  const student = await Student.findById(id);
  if (!student) {
    return next(new ErrorResponse(`Student with ID ${id} not found`, 404));
  }
  
  // Build query
  const query = { student: id };
  
  // Add date range if provided
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  // Get attendance records
  const attendanceRecords = await Attendance.find(query).sort({ date: -1 });
  
  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords
  });
});

/**
 * @desc    Delete attendance record
 * @route   DELETE /api/attendance/:id
 * @access  Private (Admin)
 */
exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);
  
  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id ${req.params.id}`, 404));
  }
  
  await attendance.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});