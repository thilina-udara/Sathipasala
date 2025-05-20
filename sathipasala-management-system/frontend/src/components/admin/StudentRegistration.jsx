import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

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

    try {
      console.log('Submitting form with gender:', formData.gender); // Debug log
    
      // Create form data object for multipart/form-data submission
      const submitData = new FormData();
      
      // Add student information
      submitData.append('name[en]', `${formData.firstName} ${formData.lastName}`);
      submitData.append('name[si]', formData.sinhalaName || `${formData.firstName} ${formData.lastName}`);
      submitData.append('dateOfBirth', formData.dateOfBirth);
      submitData.append('gender', formData.gender); // Now using "M" or "F"
      submitData.append('ageGroup', formData.ageGroup);
      submitData.append('classYear', formData.classYear);
      submitData.append('classCode', formData.classCode);
      
      // Add parent information
      submitData.append('parentInfo[name][en]', formData.parentInfo.name);
      submitData.append('parentInfo[name][si]', formData.parentInfo.name);
      submitData.append('parentInfo[phone]', formData.parentInfo.phone);
      submitData.append('parentInfo[email]', formData.parentInfo.email);
      submitData.append('parentInfo[address]', formData.parentInfo.address);
      
      // Add emergency contact if provided
      if (formData.emergencyContact) {
        submitData.append('emergencyContact', formData.emergencyContact);
      }
      
      // Add profile image if provided
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }
      
      console.log('Submitting new student registration');
      
      // Send data to API
      const response = await axios.post('/api/students', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMessage({
        type: 'success',
        text: `Student registered successfully. ID: ${response.data.data?.studentId || 'N/A'}`
      });
      
      // Reset form after successful submission
      setFormData({
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
                <option value="M">{t('admin.students.male')}</option>
                <option value="F">{t('admin.students.female')}</option>
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
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    dark:file:bg-blue-900 dark:file:text-blue-200
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum 2MB, JPG or PNG format only
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