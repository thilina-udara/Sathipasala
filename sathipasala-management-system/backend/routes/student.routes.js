const express = require('express');
const {
  registerStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getClassGroups
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const Student = require('../models/Student'); // Ensure the Student model is required

const router = express.Router();

// Add debugging middleware to check route resolution
router.use((req, res, next) => {
  console.log(`Student route requested: ${req.method} ${req.originalUrl}`);
  next();
});

// List/create students
router
  .route('/')
  .post(protect, authorize('admin'), upload.single('profileImage'), registerStudent)
  .get(protect, authorize('admin', 'teacher'), getStudents);

// Special fixed routes MUST come before the dynamic :id route
console.log('Registering special /classes route');
router
  .route('/classes')
  .get(protect, authorize('admin', 'teacher'), (req, res, next) => {
    console.log('Classes endpoint triggered');
    getClassGroups(req, res, next);
  });

// Create a special middleware to handle ID parameters but reject 'classes'
router.param('id', (req, res, next, id) => {
  if (id === 'classes') {
    console.log('Rejected "classes" as ID parameter - using special route instead');
    return res.status(400).json({
      success: false,
      message: 'Invalid student ID: Use /api/students/classes endpoint for class data'
    });
  }
  next();
});

// Student by ID routes
router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, authorize('admin'), upload.single('profileImage'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

// Debug route to check image data
router.get('/debug/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      imageData: student.profileImage,
      message: 'Student image data retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;