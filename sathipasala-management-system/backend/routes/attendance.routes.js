const express = require('express');
const {
  getAttendanceByDate,
  markAttendance,
  markBatchAttendance,
  getStudentAttendance,
  deleteAttendance
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Attendance route requested: ${req.method} ${req.originalUrl}`);
  next();
});

// Batch attendance route
router
  .route('/batch')
  .post(protect, authorize('admin', 'teacher'), markBatchAttendance);

// Date-specific attendance
router
  .route('/date/:date')
  .get(protect, getAttendanceByDate);

// Student-specific attendance - FIXED: Changed from getAttendanceByStudent to getStudentAttendance
router
  .route('/student/:id')
  .get(protect, getStudentAttendance);

// Individual attendance records
router
  .route('/')
  .post(protect, authorize('admin', 'teacher'), markAttendance);

// Delete attendance record
router
  .route('/:id')
  .delete(protect, authorize('admin'), deleteAttendance);

module.exports = router;