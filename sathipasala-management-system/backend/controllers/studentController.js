const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const fs = require('fs');
const path = require('path');

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete profile image if exists
    if (student.profileImage && student.profileImage.public_id) {
      try {
        const imagePath = path.join(__dirname, '../public/uploads/students', student.profileImage.public_id);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error("Error deleting student profile image:", err);
        // Continue with student deletion even if image deletion fails
      }
    }
    
    // Update attendance records where this student is referenced
    // Remove the student from attendance records rather than deleting the records
    await Attendance.updateMany(
      { 'students.studentId': student.studentId },
      { $pull: { students: { studentId: student.studentId } } }
    );
    
    // Use deleteOne instead of remove() which is deprecated
    await Student.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student: ' + error.message
    });
  }
};