const mongoose = require('mongoose');

// Try to require uuid but make it optional
let uuidv4;
try {
  const { v4 } = require('uuid');
  uuidv4 = v4;
} catch (err) {
  // If uuid is not available, create a simple ID generator
  uuidv4 = () => {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });
  };
  console.warn('uuid package not found, using fallback ID generator');
}

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      default: () => {
        // Generate a unique student ID (e.g., SP2023001)
        const year = new Date().getFullYear();
        const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        return `SP${year}${randomId}`;
      },
    },
    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true,
      },
      si: {
        type: String,
        trim: true,
      },
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['M', 'F', 'O'], // M = Male, F = Female, O = Other
    },
    ageGroup: {
      type: String,
      required: [true, 'Age group is required'],
      enum: ['3-6', '7-10', '11-13', '14+'],
    },
    classYear: {
      type: String,
      required: [true, 'Class year is required'],
    },
    classCode: {
      type: String,
      required: [true, 'Class code is required'],
      enum: ['ADH', 'MET', 'KHA', 'NEK'], // Class codes
    },
    parentInfo: {
      name: {
        en: {
          type: String,
          required: [true, 'Parent name is required'],
          trim: true,
        },
        si: {
          type: String,
          trim: true,
        },
      },
      phone: {
        type: String,
        required: [true, 'Parent phone number is required'],
      },
      email: {
        type: String,
        match: [
          /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
          'Please provide a valid email',
        ],
      },
      address: {
        type: String,
        required: [true, 'Parent address is required'],
      },
    },
    emergencyContact: {
      type: String,
    },
    profileImage: {
      url: String,
      filename: String,
    },
    // Attendance summary for quick stats
    attendanceSummary: {
      presentDays: {
        type: Number,
        default: 0,
      },
      absentDays: {
        type: Number,
        default: 0,
      },
      lateDays: {
        type: Number,
        default: 0,
      },
      totalDays: {
        type: Number,
        default: 0,
      },
      attendanceRate: {
        type: Number,
        default: 0, // Percentage
      },
      presentRate: {
        type: Number,
        default: 0, // Percentage
      },
      absentRate: {
        type: Number,
        default: 0, // Percentage
      },
      lastAttendance: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for age calculation
StudentSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  
  return age;
});

// Add virtual for attendance records relationship
StudentSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'student',
  justOne: false
});

// Middleware to handle data before saving
StudentSchema.pre('save', function (next) {
  // Generate student ID if not provided
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    this.studentId = `SP${year}${randomId}`;
  }
  
  next();
});

module.exports = mongoose.model('Student', StudentSchema);
