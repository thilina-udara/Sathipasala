const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    en: {
      type: String,
      required: [true, 'English name is required']
    },
    si: {
      type: String,
      required: [true, 'Sinhala name is required']
    }
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  ageGroup: {
    type: String,
    enum: ['3-6', '7-10', '11-14', '15-17'],
    required: [true, 'Age group is required']
  },
  classYear: {
    type: String,
    required: [true, 'Class year is required']
  },
  classCode: {
    type: String,
    required: [true, 'Class code is required']
  },
  parentInfo: {
    name: {
      en: String,
      si: String
    },
    phone: {
      type: String,
      required: [true, 'Parent phone number is required']
    },
    email: String,
    address: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  profileImage: {
    public_id: String,
    url: String
  },
  userId: {
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

module.exports = mongoose.model('Student', studentSchema);