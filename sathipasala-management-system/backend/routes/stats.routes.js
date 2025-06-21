const express = require('express');
const { 
  getClassStats, 
  getStudentCountsByClass,
  getAttendanceByClass,
  getClassAnalysis,
  getLatestClassAnalysis,
  getLatestTrends
} = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Class stats routes
router.get('/classes', authorize('admin', 'teacher'), getClassStats);
router.get('/student-counts-by-class', authorize('admin', 'teacher'), getStudentCountsByClass);
router.get('/attendance-by-class', authorize('admin', 'teacher'), getAttendanceByClass);
router.get('/class-analysis', authorize('admin', 'teacher'), getClassAnalysis);

// Latest data routes
router.get('/latest-class-analysis', authorize('admin', 'teacher'), getLatestClassAnalysis);
router.get('/latest-trends', authorize('admin', 'teacher'), getLatestTrends);

// Export router
module.exports = router;
