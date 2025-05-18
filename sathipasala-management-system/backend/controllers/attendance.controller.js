const Student = require('../models/student.model');
const Attendance = require('../models/attendance.model');
const Event = require('../models/event.model');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO, format } = require('date-fns');

// @desc    Mark attendance for students
// @route   POST /api/attendance
// @access  Private/Admin,Teacher
exports.markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }
    
    const attendanceDate = new Date(date);
    const results = [];
    
    for (const record of records) {
      const { studentId, status, reason, flowerOffering } = record;
      
      // Find student to ensure they exist
      const student = await Student.findById(studentId);
      if (!student) {
        results.push({
          studentId,
          success: false,
          message: 'Student not found'
        });
        continue;
      }
      
      try {
        // Check if attendance record already exists for this student on this date
        let attendanceRecord = await Attendance.findOne({
          studentId,
          date: {
            $gte: startOfDay(attendanceDate),
            $lte: endOfDay(attendanceDate)
          }
        });
        
        if (attendanceRecord) {
          // Update existing record
          attendanceRecord.status = status;
          attendanceRecord.reason = reason || '';
          
          if (flowerOffering) {
            attendanceRecord.flowerOffering = {
              brought: flowerOffering.brought || false,
              flowerType: flowerOffering.flowerType || '',
              notes: flowerOffering.notes || ''
            };
          }
          
          await attendanceRecord.save();
        } else {
          // Create new record
          attendanceRecord = await Attendance.create({
            studentId,
            date: attendanceDate,
            status,
            reason: reason || '',
            flowerOffering: flowerOffering || { brought: false },
            markedBy: req.user._id
          });
        }
        
        results.push({
          studentId,
          success: true,
          data: attendanceRecord
        });
      } catch (err) {
        results.push({
          studentId,
          success: false,
          message: err.message
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark attendance'
    });
  }
};

// @desc    Get attendance records for a specific student
// @route   GET /api/attendance/student/:id
// @access  Private/Admin,Teacher
exports.getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Find the student to ensure they exist
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Create date filters
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = startOfDay(new Date(startDate));
    }
    if (endDate) {
      dateFilter.$lte = endOfDay(new Date(endDate));
    }
    
    // Find all attendance records for this student
    const attendanceRecords = await Attendance.find({
      studentId: id,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {})
    }).sort({ date: 1 });
    
    // Transform records for the frontend
    const formattedRecords = attendanceRecords.map(record => ({
      date: format(record.date, 'yyyy-MM-dd'),
      status: record.status,
      reason: record.reason || '',
      flowerOffering: record.flowerOffering || { brought: false }
    }));
    
    // Calculate summary statistics
    const totalRecords = formattedRecords.length;
    const presentCount = formattedRecords.filter(r => r.status === 'present').length;
    const absentCount = formattedRecords.filter(r => r.status === 'absent').length;
    const lateCount = formattedRecords.filter(r => r.status === 'late').length;
    const flowerCount = formattedRecords.filter(r => r.flowerOffering?.brought).length;
    
    const attendanceRate = totalRecords > 0 
      ? (presentCount / totalRecords * 100).toFixed(1) 
      : 0;
    
    return res.status(200).json({
      success: true,
      data: formattedRecords,
      summary: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        flowerOfferings: flowerCount,
        attendanceRate
      }
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attendance records'
    });
  }
};

// @desc    Get events (holidays, poya days, etc)
// @route   GET /api/attendance/events
// @access  Private/Admin,Teacher
exports.getEvents = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let dateFilter = {};
    
    if (year && month) {
      const startDate = startOfMonth(new Date(year, month - 1, 1));
      const endDate = endOfMonth(new Date(year, month - 1, 1));
      dateFilter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    const events = await Event.find(dateFilter);
    
    return res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch events'
    });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private/Admin,Teacher
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, classYear, classCode } = req.query;
    
    // Create filters
    let dateFilter = {};
    if (startDate) {
      dateFilter.$gte = startOfDay(new Date(startDate));
    }
    if (endDate) {
      dateFilter.$lte = endOfDay(new Date(endDate));
    }
    
    // Find all students matching class filters
    const studentFilter = {};
    if (classYear) studentFilter.classYear = classYear;
    if (classCode) studentFilter.classCode = classCode;
    
    const students = await Student.find(studentFilter);
    
    // Get attendance records for these students
    const studentIds = students.map(s => s._id);
    
    const attendanceRecords = await Attendance.find({
      studentId: { $in: studentIds },
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {})
    });
    
    // Organize data by date and student
    const reportData = {};
    const studentMap = {};
    
    // Build student map for quick lookup
    students.forEach(student => {
      studentMap[student._id] = {
        id: student._id,
        studentId: student.studentId,
        name: student.name
      };
    });
    
    // Organize attendance data
    attendanceRecords.forEach(record => {
      const dateStr = format(record.date, 'yyyy-MM-dd');
      
      if (!reportData[dateStr]) {
        reportData[dateStr] = {
          date: dateStr,
          total: students.length,
          present: 0,
          absent: 0,
          late: 0,
          flowerOfferings: 0,
          students: {}
        };
      }
      
      reportData[dateStr].students[record.studentId] = {
        status: record.status,
        reason: record.reason,
        flowerOffering: record.flowerOffering
      };
      
      // Update counters
      if (record.status === 'present') reportData[dateStr].present++;
      else if (record.status === 'absent') reportData[dateStr].absent++;
      else if (record.status === 'late') reportData[dateStr].late++;
      
      if (record.flowerOffering?.brought) {
        reportData[dateStr].flowerOfferings++;
      }
    });
    
    // Calculate attendance rates
    const report = Object.values(reportData).map(day => {
      const attendanceRate = ((day.present + day.late) / day.total * 100).toFixed(1);
      return {
        ...day,
        attendanceRate
      };
    });
    
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate attendance report'
    });
  }
};