const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Get attendance for specific student
router.get('/student/:id', protect, authorize('admin', 'teacher'), attendanceController.getStudentAttendance);

// Mark attendance for students
router.post('/', protect, authorize('admin', 'teacher'), attendanceController.markAttendance);

// Get events (holidays, poya days, etc.)
router.get('/events', protect, authorize('admin', 'teacher'), attendanceController.getEvents);

// Get attendance report
router.get('/report', protect, authorize('admin', 'teacher'), attendanceController.getAttendanceReport);

module.exports = router;