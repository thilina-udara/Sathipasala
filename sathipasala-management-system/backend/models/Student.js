const mongoose = require('mongoose');
const { generateUniqueStudentId } = require('../utils/idGenerator');

const StudentSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
      },
      si: {
        type: String,
        trim: true,
        maxlength: [100, 'Sinhala name cannot be more than 100 characters'],
      },
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'], // Only these two values are allowed
      required: [true, 'Gender is required'],
    },
    ageGroup: {
      type: String,
      enum: ['3-6', '7-10', '11-13', '14+'],
      required: [true, 'Age group is required'],
    },
    classYear: {
      type: String,
      required: [true, 'Class year is required'],
    },
    classCode: {
      type: String,
      enum: ['ADH', 'MET', 'KHA', 'NEK'],
      required: [true, 'Class code is required'],
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
        required: [true, 'Parent phone is required'],
      },
      email: String,
      address: String,
    },
    emergencyContact: String,
    profileImage: {
      url: String,
      public_id: String,
      filename: String,
      uploadedAt: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate student ID before saving
StudentSchema.pre('save', async function (next) {
  try {
    // Only generate ID if it doesn't exist
    if (!this.studentId) {
      console.log('Generating new Student ID...');
      this.studentId = await generateUniqueStudentId();
      console.log(`✓ Assigned Student ID: ${this.studentId}`);
    }
    next();
  } catch (error) {
    console.error('Error in Student pre-save hook:', error);
    next(error);
  }
});

// Create and export the model
const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;

// In StudentRegistration.jsx - Update the handleSubmit function to ensure proper gender format

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage({ type: '', text: '' });

  try {
    // Make sure gender is capitalized correctly to match enum in Student model
    if (!formData.gender) {
      setMessage({
        type: 'error',
        text: 'Please select a gender'
      });
      setLoading(false);
      return;
    }

    // Create JSON object for submission instead of FormData
    const submitData = {
      name: {
        en: `${formData.firstName} ${formData.lastName}`,
        si: formData.sinhalaName || `${formData.firstName} ${formData.lastName}`
      },
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender, // This should already be 'Male' or 'Female' from the select
      ageGroup: formData.ageGroup,
      classYear: formData.classYear,
      classCode: formData.classCode,
      parentInfo: {
        name: {
          en: formData.parentInfo.name,
          si: formData.parentInfo.name
        },
        phone: formData.parentInfo.phone,
        email: formData.parentInfo.email || '',
        address: formData.parentInfo.address
      },
      emergencyContact: formData.emergencyContact || ''
    };

    // Add profile image data if available (from CloudinaryUpload)
    if (formData.profileImage) {
      submitData.profileImage = formData.profileImage;
    }

    console.log('Submitting student data:', submitData);

    // Send JSON data
    const response = await axios.post('/api/students', submitData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    setMessage({
      type: 'success',
      text: `Student registered successfully! ID: ${response.data.data?.studentId || 'N/A'}`
    });

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      sinhalaName: '',
      dateOfBirth: '',
      gender: '',
      ageGroup: '3-6',
      classYear: new Date().getFullYear().toString(),
      classCode: 'ADH',
      parentInfo: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      emergencyContact: ''
    });
    setImagePreview(null);
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
  } catch (error) {
    console.error("Registration error:", error);
    setMessage({
      type: 'error',
      text: error.response?.data?.message || 'Failed to register student'
    });
  } finally {
    setLoading(false);
  }
};
