const mongoose = require('mongoose');

// Define schema without any indexes at first
const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide student ID']
  },
  date: {
    type: Date,
    required: [true, 'Please provide attendance date']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  broughtFlowers: {
    type: Boolean,
    default: false
  },
  flowerType: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Disable automatic index creation to prevent conflicts
  autoIndex: false
});

// Virtual for flower offering
AttendanceSchema.virtual('flowerOffering').get(function() {
  return {
    brought: this.broughtFlowers,
    type: this.broughtFlowers ? (this.flowerType || 'Mixed Flowers') : null
  };
});

// Ensure virtual fields are serialized
AttendanceSchema.set('toJSON', { virtuals: true });

// Create a single compound index on student and date
// This will ensure each student can only have one attendance record per day
// regardless of class
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Export the model
module.exports = mongoose.model('Attendance', AttendanceSchema);
