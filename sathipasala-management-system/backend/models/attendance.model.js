const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'absent'
  },
  reason: {
    type: String,
    default: ''
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique attendance records per student per date
attendanceSchema.index({ date: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);