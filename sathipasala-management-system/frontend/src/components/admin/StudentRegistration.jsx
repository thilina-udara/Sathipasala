import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import CloudinaryUpload from '../common/CloudinaryUpload';

const StudentRegistration = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sinhalaName: '',
    dateOfBirth: '',
    gender: '',
    ageGroup: '3-6',
    classYear: new Date().getFullYear().toString(),
    classCode: 'ADH',  // Default to Adhiṭṭhāna class
    parentInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    emergencyContact: ''
  });

  const [tempCredentials, setTempCredentials] = useState(null);

  // Add this function within your StudentRegistration component
  const calculateAgeAndSetAgeGroup = (birthDate) => {
    if (!birthDate) return;
    
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (
      today.getMonth() < dob.getMonth() || 
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    
    // Set appropriate age group based on age
    let ageGroup;
    if (age >= 0 && age <= 6) {
      ageGroup = '3-6';
      setFormData(prev => ({...prev, classCode: 'ADH'})); // Adhiṭṭhāna
    } else if (age >= 7 && age <= 10) {
      ageGroup = '7-10';
      setFormData(prev => ({...prev, classCode: 'MET'})); // Mettā
    } else if (age >= 11 && age <= 13) {
      ageGroup = '11-13';
      setFormData(prev => ({...prev, classCode: 'KHA'})); // Khanti
    } else if (age >= 14) {
      ageGroup = '14+';
      setFormData(prev => ({...prev, classCode: 'NEK'})); // Nekkhamma
    }
    
    // Update the form data with new age group
    setFormData(prev => ({...prev, ageGroup}));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If date of birth changed, calculate age and set age group
    if (name === 'dateOfBirth') {
      calculateAgeAndSetAgeGroup(value);
    }
    
    if (name.startsWith('parentInfo.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: t('common.errors.invalidImageType')
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: t('common.errors.imageTooLarge')
      });
      return;
    }
    
    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setImagePreview(null);
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setTempCredentials(null);

    try {
      // Create a proper JSON object for submission
      const submitData = {
        name: {
          en: `${formData.firstName} ${formData.lastName}`,
          si: formData.sinhalaName || `${formData.firstName} ${formData.lastName}`
        },
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender, 
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

      // Add profile image data from CloudinaryUpload if available
      if (formData.profileImage) {
        console.log('Adding Cloudinary profile image to submission:', formData.profileImage);
        submitData.profileImage = formData.profileImage;
      }

      console.log('Submitting student data:', submitData);
      
      // Send JSON data (not FormData)
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

      // Show credentials modal/message
      if (response.data.credentials) {
        setTempCredentials({
          studentId: response.data.credentials.studentId,
          temporaryPassword: response.data.credentials.temporaryPassword
        });
      }

      // Reset form after successful submission
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

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {message.text && (
        <div 
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Temporary Credentials Modal/Message */}
      {tempCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">Student Credentials</h2>
            <p className="mb-2 text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Student ID:</span> <span className="font-mono">{tempCredentials.studentId}</span>
            </p>
            <p className="mb-4 text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Temporary Password:</span> <span className="font-mono">{tempCredentials.temporaryPassword}</span>
            </p>
            <p className="mb-4 text-sm text-yellow-700 dark:text-yellow-300">
              Please copy and share these credentials with the student now. This password will not be shown again.
            </p>
            <button
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setTempCredentials(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              {t('admin.students.studentInformation')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.firstName')}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.lastName')}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.gender')}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">-- {t('admin.students.selectGender')} --</option>
                <option value="Male">{t('admin.students.male')}</option>
                <option value="Female">{t('admin.students.female')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age Group
              </label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                disabled={formData.dateOfBirth !== ''}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800"
              >
                <option value="3-6">3-6 years (Adhiṭṭhāna)</option>
                <option value="7-10">7-10 years (Mettā)</option>
                <option value="11-13">11-13 years (Khanti)</option>
                <option value="14+">14+ years (Nekkhamma)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Auto-assigned based on date of birth
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.classYear')}
                </label>
                <input
                  type="text"
                  name="classYear"
                  value={formData.classYear}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class
                </label>
                <select
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="ADH">Adhiṭṭhāna (අධිඨාන) - White</option>
                  <option value="MET">Mettā (මෙත්තා) - Orange</option>
                  <option value="KHA">Khanti (ඛන්ති) - Yellow</option>
                  <option value="NEK">Nekkhamma (නෙක්කම්ම) - Blue</option>
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Suggested based on age group
                </p>
              </div>
            </div>
            
            {/* Profile Photo - disabled for now */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.profilePhoto')} ({t('admin.common.optional')})
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-3xl">👤</span>
                  </div>
                )}
                
                {!imagePreview && (
                  <CloudinaryUpload
                    uploadType="student-photo"
                    onUploadSuccess={(uploadData) => {
                      console.log('Image uploaded to Cloudinary:', uploadData);
                      setImagePreview(uploadData.url);
                      // Store the full image data for submission
                      setFormData(prev => ({
                        ...prev,
                        profileImage: {
                          url: uploadData.url,
                          public_id: uploadData.public_id,
                          filename: uploadData.filename
                        }
                      }));
                    }}
                    onUploadError={(error) => {
                      console.error('Cloudinary upload error:', error);
                      setMessage({
                        type: 'error',
                        text: error
                      });
                    }}
                    acceptedTypes="image/*"
                    maxSize={5}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum 5MB, JPG, PNG or WebP format
              </p>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              {t('admin.students.parentInformation')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.parentName')}
              </label>
              <input
                type="text"
                name="parentInfo.name"
                value={formData.parentInfo.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.parentPhone')}
              </label>
              <input
                type="tel"
                name="parentInfo.phone"
                value={formData.parentInfo.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.parentEmail')}
              </label>
              <input
                type="email"
                name="parentInfo.email"
                value={formData.parentInfo.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.emergencyContact')} ({t('admin.common.optional')})
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder={t('admin.students.emergencyContactPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.address')}
              </label>
              <textarea
                name="parentInfo.address"
                value={formData.parentInfo.address}
                onChange={handleChange}
                rows="3"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
          >
            {loading ? t('common.submitting') : t('admin.students.registerStudent')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;