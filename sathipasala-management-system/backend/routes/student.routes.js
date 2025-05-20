const express = require('express');
const {
  registerStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin'), upload.single('profileImage'), registerStudent)
  .get(protect, authorize('admin', 'teacher'), getStudents);

router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, authorize('admin'), upload.single('profileImage'), updateStudent) // Add upload middleware here
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;