const express = require('express');
const { getTeacherAssignments } = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Teacher assignment routes
router.get('/assignments', authorize('admin', 'teacher'), getTeacherAssignments);

// Export router
module.exports = router;
