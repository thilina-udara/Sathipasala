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
  try {
    const classes = await Student.aggregate([
      {
        $group: {
          _id: '$classCode',
          totalStudents: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    next(new ErrorResponse('Error fetching class stats', 500));
  }
});

/**
 * @desc    Get student counts by class
 * @route   GET /api/stats/student-counts-by-class
 * @access  Private (Admin, Teacher)
 */
exports.getStudentCountsByClass = asyncHandler(async (req, res, next) => {
  try {
    const counts = await Student.aggregate([
      {
        $group: {
          _id: '$classCode',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    next(new ErrorResponse('Error fetching student counts', 500));
  }
});

/**
 * @desc    Get attendance by class
 * @route   GET /api/stats/attendance-by-class
 * @access  Private (Admin, Teacher)
 */
exports.getAttendanceByClass = asyncHandler(async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      { $unwind: '$studentData' },
      {
        $group: {
          _id: {
            classCode: '$studentData.classCode',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.classCode',
          attendance: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(new ErrorResponse('Error fetching attendance by class', 500));
  }
});

/**
 * @desc    Get comprehensive class analysis
 * @route   GET /api/stats/class-analysis
 * @access  Private (Admin, Teacher)
 */
exports.getClassAnalysis = asyncHandler(async (req, res, next) => {
  try {
    const { startDate, endDate, classCode } = req.query;
    
    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log(`Fetching class analysis from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`);
    
    // Build student query
    const studentQuery = {};
    if (classCode) {
      studentQuery.classCode = classCode;
    }
    
    // Get all students (or filtered by class)
    const students = await Student.find(studentQuery).select('_id classCode');
    
    // Create student-to-class mapping
    const studentClassMap = {};
    const classTotals = { ADH: 0, MET: 0, KHA: 0, NEK: 0 };
    
    students.forEach(student => {
      studentClassMap[student._id.toString()] = student.classCode;
      if (classTotals.hasOwnProperty(student.classCode)) {
        classTotals[student.classCode]++;
      }
    });
    
    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      date: { $gte: start, $lte: end },
      student: { $in: students.map(s => s._id) }
    }).populate('student', 'classCode');
    
    // Initialize class analysis data
    const classAnalysis = {};
    Object.keys(classTotals).forEach(classCode => {
      classAnalysis[classCode] = {
        totalStudents: classTotals[classCode],
        presentCount: 0,
        absentCount: 0,
        flowerCount: 0,
        totalDays: 0,
        attendanceRate: 0
      };
    });
    
    // Count Sundays in the date range for totalDays calculation
    let totalSundays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) totalSundays++;
    }
    
    // Process attendance records
    attendanceRecords.forEach(record => {
      const classCode = record.student?.classCode;
      if (classCode && classAnalysis[classCode]) {
        // Count attendance status
        if (record.status === 'present') {
          classAnalysis[classCode].presentCount++;
        } else if (record.status === 'absent') {
          classAnalysis[classCode].absentCount++;
        }
        
        // Count flower offerings
        if (record.broughtFlowers) {
          classAnalysis[classCode].flowerCount++;
        }
      }
    });
    
    // Calculate attendance rates and set total days
    Object.keys(classAnalysis).forEach(classCode => {
      const data = classAnalysis[classCode];
      data.totalDays = totalSundays;
      
      const totalAttendanceRecords = data.presentCount + data.absentCount;
      const expectedTotal = data.totalStudents * totalSundays;
      
      if (expectedTotal > 0) {
        data.attendanceRate = Math.round((data.presentCount / expectedTotal) * 100);
      }
    });
    
    console.log('Class analysis completed:', classAnalysis);
    
    res.status(200).json({
      success: true,
      data: classAnalysis
    });
    
  } catch (error) {
    console.error('Error in getClassAnalysis:', error);
    next(new ErrorResponse('Error fetching class analysis', 500));
  }
});

/**
 * @desc    Get latest attendance analysis (most recent day only)
 * @route   GET /api/stats/latest-class-analysis
 * @access  Private (Admin, Teacher)
 */
exports.getLatestClassAnalysis = asyncHandler(async (req, res, next) => {
  try {
    const { classCode } = req.query;
    
    console.log('Fetching latest attendance data...');
    
    // Find the most recent attendance date
    const latestAttendance = await Attendance.findOne()
      .sort({ date: -1 })
      .select('date');
    
    if (!latestAttendance) {
      return res.status(200).json({
        success: true,
        data: {},
        message: 'No attendance records found'
      });
    }
    
    const latestDate = latestAttendance.date;
    console.log(`Latest attendance date: ${latestDate.toISOString().split('T')[0]}`);
    
    // Build student query
    const studentQuery = {};
    if (classCode) {
      studentQuery.classCode = classCode;
    }
    
    // Get all students (or filtered by class)
    const students = await Student.find(studentQuery).select('_id classCode');
    
    // Create student-to-class mapping
    const studentClassMap = {};
    const classTotals = { ADH: 0, MET: 0, KHA: 0, NEK: 0 };
    
    students.forEach(student => {
      studentClassMap[student._id.toString()] = student.classCode;
      if (classTotals.hasOwnProperty(student.classCode)) {
        classTotals[student.classCode]++;
      }
    });
    
    // Get attendance records for ONLY the latest date
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate()),
        $lt: new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate() + 1)
      },
      student: { $in: students.map(s => s._id) }
    }).populate('student', 'classCode');
    
    // Initialize class analysis data
    const classAnalysis = {};
    Object.keys(classTotals).forEach(classCode => {
      classAnalysis[classCode] = {
        totalStudents: classTotals[classCode],
        presentCount: 0,
        absentCount: 0,
        flowerCount: 0,
        attendanceRate: 0,
        latestDate: latestDate.toISOString().split('T')[0]
      };
    });
    
    // Process attendance records for the latest date only
    attendanceRecords.forEach(record => {
      const classCode = record.student?.classCode;
      if (classCode && classAnalysis[classCode]) {
        // Count attendance status
        if (record.status === 'present') {
          classAnalysis[classCode].presentCount++;
        } else if (record.status === 'absent') {
          classAnalysis[classCode].absentCount++;
        }
        
        // Count flower offerings
        if (record.broughtFlowers) {
          classAnalysis[classCode].flowerCount++;
        }
      }
    });
    
    // Calculate attendance rates for the latest day
    Object.keys(classAnalysis).forEach(classCode => {
      const data = classAnalysis[classCode];
      const totalAttendanceRecords = data.presentCount + data.absentCount;
      
      if (data.totalStudents > 0) {
        data.attendanceRate = Math.round((data.presentCount / data.totalStudents) * 100);
      }
    });
    
    console.log('Latest class analysis completed:', classAnalysis);
    
    res.status(200).json({
      success: true,
      data: classAnalysis,
      latestDate: latestDate.toISOString().split('T')[0]
    });
    
  } catch (error) {
    console.error('Error in getLatestClassAnalysis:', error);
    next(new ErrorResponse('Error fetching latest class analysis', 500));
  }
});

/**
 * @desc    Get latest attendance trends (most recent month)
 * @route   GET /api/stats/latest-trends
 * @access  Private (Admin, Teacher)
 */
exports.getLatestTrends = asyncHandler(async (req, res, next) => {
  try {
    const { classCode } = req.query;
    
    console.log('Fetching latest trends data...');
    
    // Find the most recent attendance date
    const latestAttendance = await Attendance.findOne()
      .sort({ date: -1 })
      .select('date');
    
    if (!latestAttendance) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No attendance records found'
      });
    }
    
    const latestDate = latestAttendance.date;
    const currentMonth = latestDate.getMonth();
    const currentYear = latestDate.getFullYear();
    
    // Get start and end of current month
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    console.log(`Fetching trends for ${monthStart.toISOString().split('T')[0]} to ${monthEnd.toISOString().split('T')[0]}`);
    
    // Build query
    const matchQuery = {
      date: { $gte: monthStart, $lte: monthEnd }
    };
    
    if (classCode) {
      const students = await Student.find({ classCode }).select('_id');
      matchQuery.student = { $in: students.map(s => s._id) };
    }
    
    // Aggregate by date within the current month
    const trends = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
          },
          flowers: {
            $sum: { $cond: ["$broughtFlowers", 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          present: 1,
          absent: 1,
          flowers: 1,
          attendanceRate: {
            $round: {
              $multiply: [
                { $divide: ["$present", { $add: ["$present", "$absent"] }] },
                100
              ]
            }
          }
        }
      }
    ]);
    
    // Format for frontend (show dates instead of months)
    const formattedTrends = trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      present: trend.present,
      absent: trend.absent,
      flowers: trend.flowers,
      attendanceRate: trend.attendanceRate || 0
    }));
    
    res.status(200).json({
      success: true,
      data: formattedTrends,
      period: `${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    });
    
  } catch (error) {
    console.error('Error in getLatestTrends:', error);
    next(new ErrorResponse('Error fetching latest trends', 500));
  }
});
