const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get class statistics
 * @route   GET /api/stats/classes
 * @access  Private (Admin, Teacher)
 */
exports.getClassStats = asyncHandler(async (req, res, next) => {
  // This is handled by the student counts and attendance endpoints
  res.status(200).json({
    success: true,
    data: {} 
  });
});

/**
 * @desc    Get student counts by class code
 * @route   GET /api/stats/student-counts-by-class
 * @access  Private (Admin, Teacher)
 */
exports.getStudentCountsByClass = asyncHandler(async (req, res, next) => {
  try {
    // Get counts of students in each class
    const studentCounts = await Student.aggregate([
      { 
        $group: {
          _id: '$classCode',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the results into an object with class codes as keys
    const result = {};
    
    // Initialize with zero counts for all classes
    result.ADH = 0;
    result.MET = 0;
    result.KHA = 0;
    result.NEK = 0;
    
    // Fill in actual counts from the database
    studentCounts.forEach(item => {
      if (item._id && result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Error in getStudentCountsByClass:', err);
    next(new ErrorResponse('Error fetching student counts', 500));
  }
});

/**
 * @desc    Get attendance rates by class
 * @route   GET /api/stats/attendance-by-class
 * @access  Private (Admin, Teacher)
 */
exports.getAttendanceByClass = asyncHandler(async (req, res, next) => {
  try {
    // Get attendance data from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // First get all students with their class codes
    const students = await Student.find({}, '_id classCode');
    const studentMap = {};
    
    // Create a map of student IDs to their class codes
    students.forEach(student => {
      if (student._id && student.classCode) {
        studentMap[student._id.toString()] = student.classCode;
      }
    });
    
    // Get attendance records
    const attendanceRecords = await Attendance.find({
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });
    
    // Group attendance by class codes
    const classSummary = {
      ADH: { present: 0, total: 0, lastDate: null },
      MET: { present: 0, total: 0, lastDate: null },
      KHA: { present: 0, total: 0, lastDate: null },
      NEK: { present: 0, total: 0, lastDate: null }
    };
    
    // Process attendance records
    attendanceRecords.forEach(record => {
      const studentId = record.student?.toString();
      const classCode = studentMap[studentId];
      
      // Only process if we know the class code
      if (classCode && classSummary[classCode]) {
        // Update totals
        classSummary[classCode].total += 1;
        
        if (record.status === 'present') {
          classSummary[classCode].present += 1;
        }
        
        // Update last class date if needed
        if (!classSummary[classCode].lastDate || record.date > classSummary[classCode].lastDate) {
          classSummary[classCode].lastDate = record.date;
        }
      }
    });
    
    // Calculate rates
    const result = {};
    Object.keys(classSummary).forEach(classCode => {
      const summary = classSummary[classCode];
      result[classCode] = {
        rate: summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0,
        lastDate: summary.lastDate ? summary.lastDate.toISOString().split('T')[0] : null
      };
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Error in getAttendanceByClass:', err);
    next(new ErrorResponse('Error fetching attendance statistics', 500));
  }
});

/**
 * @desc    Get teacher assignments to classes
 * @route   GET /api/teachers/assignments
 * @access  Private (Admin, Teacher)
 */
exports.getTeacherAssignments = asyncHandler(async (req, res, next) => {
  // For now, we'll return mock data
  // In a real implementation, this would come from a database of teacher assignments
  const assignments = {
    ADH: ['Mihiri Rathnayake', 'Lakshmi Perera'],
    MET: ['Anura Bandara', 'Chamini Silva'],
    KHA: ['Tharaka Fernando', 'Dinesh Jayawardena'],
    NEK: ['Priya Gunasekara', 'Nadun Amarasinghe']
  };

  res.status(200).json({
    success: true,
    data: assignments
  });
});
