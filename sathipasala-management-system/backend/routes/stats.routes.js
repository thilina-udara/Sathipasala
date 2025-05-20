const express = require('express');
const { 
  getClassStats, 
  getStudentCountsByClass,
  getAttendanceByClass,
  getTeacherAssignments
} = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Class stats routes
router.get('/classes', authorize('admin', 'teacher'), getClassStats);
router.get('/student-counts-by-class', authorize('admin', 'teacher'), getStudentCountsByClass);
router.get('/attendance-by-class', authorize('admin', 'teacher'), getAttendanceByClass);

// Export router
module.exports = router;
