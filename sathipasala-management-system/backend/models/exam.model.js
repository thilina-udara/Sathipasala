const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    en: {
      type: String,
      required: [true, 'English exam title is required']
    },
    si: {
      type: String,
      required: [true, 'Sinhala exam title is required']
    }
  },
  date: {
    type: Date,
    required: true
  },
  ageGroup: {
    type: String,
    enum: ['3-6', '7-10', '11-14', '15-17'],
    required: true
  },
  examType: {
    type: String,
    enum: ['written', 'oral', 'combined'],
    default: 'written'
  },
  maxScore: {
    type: Number,
    required: true
  },
  passMark: {
    type: Number,
    required: true
  },
  createdBy: {
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

const examResultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  writtenScore: {
    type: Number,
    default: 0
  },
  oralScore: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  remarks: {
    en: String,
    si: String
  },
  gradedBy: {
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

// Compound index to ensure unique exam results per student per exam
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

const Exam = mongoose.model('Exam', examSchema);
const ExamResult = mongoose.model('ExamResult', examResultSchema);

module.exports = { Exam, ExamResult };