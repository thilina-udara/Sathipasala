const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'Please add an English name']
    },
    si: {
      type: String
    }
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  // NEW: Student ID field for student login
  studentId: {
    type: String,
    sparse: true, // Allow multiple null values, but enforce uniqueness for non-null values
    unique: true,
    validate: {
      validator: function(v) {
        // Only validate format if studentId is provided
        if (!v) return true;
        return /^BSP_\d{2}_\d{4}$/.test(v);
      },
      message: 'Student ID must follow format BSP_YY_NNNN'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'parent'],
    default: 'student'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  firstLogin: {
    type: Boolean,
    default: true
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'si'],
    default: 'en'
  },
  // NEW: Track if student account is active (for 4-week absence rule)
  isActive: {
    type: Boolean,
    default: true
  },
  // NEW: Track last attendance date for students
  lastAttendanceDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);