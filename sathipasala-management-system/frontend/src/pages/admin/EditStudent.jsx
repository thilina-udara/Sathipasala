import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const EditStudent = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  
  // Original student data from API
  const [originalStudent, setOriginalStudent] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    ageGroup: '',
    classYear: '',
    classCode: '',
    parentInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    emergencyContact: ''
  });
  
  // Image handling
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  
  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use timestamp for cache busting
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/students/${id}?_t=${timestamp}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch student data');
        }
        
        const student = response.data.data;
        setOriginalStudent(student);
        
        console.log("Received student data from backend:", student);
        
        // Parse student name into first and last name
        let firstName = '', lastName = '';
        if (student.name && student.name.en) {
          const nameParts = student.name.en.trim().split(' ');
          if (nameParts.length > 1) {
            lastName = nameParts.pop();
            firstName = nameParts.join(' ');
          } else {
            firstName = nameParts[0] || '';
          }
        }
        
        // Set form data from student object
        setFormData({
          firstName,
          lastName,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
          gender: student.gender || '', // Store exactly as is from the backend
          ageGroup: student.ageGroup || '',
          classYear: student.classYear || '',
          classCode: student.classCode || '',
          parentInfo: {
            name: student.parentInfo?.name?.en || '',
            phone: student.parentInfo?.phone || '',
            email: student.parentInfo?.email || '',
            address: student.parentInfo?.address || ''
          },
          emergencyContact: student.emergencyContact || ''
        });
        
        console.log("Form data initialized:", {
          name: `${firstName} ${lastName}`,
          gender: student.gender,
          initialFormGender: student.gender || ''
        });
        
        // Set existing profile image if available
        if (student.profileImage?.url) {
          setExistingImage(student.profileImage.url);
          setImagePreview(student.profileImage.url);
        }
        
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.response?.data?.message || 'Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [id]);
  
  // Calculate age and set age group
  const calculateAgeAndSetAgeGroup = (birthDate) => {
    if (!birthDate) return;
    
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    
    if (
      today.getMonth() < dob.getMonth() || 
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    
    // Determine age group based on age
    let ageGroup = '';
    if (age >= 0 && age <= 6) {
      ageGroup = '3-6';
      setFormData(prev => ({...prev, ageGroup, classCode: 'ADH'})); // Adhiṭṭhāna
    } else if (age >= 7 && age <= 10) {
      ageGroup = '7-10';
      setFormData(prev => ({...prev, ageGroup, classCode: 'MET'})); // Mettā
    } else if (age >= 11 && age <= 13) {
      ageGroup = '11-13';
      setFormData(prev => ({...prev, ageGroup, classCode: 'KHA'})); // Khanti
    } else if (age >= 14) {
      ageGroup = '14+';
      setFormData(prev => ({...prev, ageGroup, classCode: 'NEK'})); // Nekkhamma
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please use JPG, PNG or GIF format.');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image is too large. Maximum size is 2MB.');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image removal
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create FormData object
      const submitData = new FormData();
      
      // Basic student information
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      submitData.append('name[en]', fullName);
      submitData.append('name[si]', formData.firstName);
      submitData.append('dateOfBirth', formData.dateOfBirth);
      submitData.append('gender', formData.gender); // This should now be "M" or "F"
      submitData.append('ageGroup', formData.ageGroup);
      submitData.append('classYear', formData.classYear);
      submitData.append('classCode', formData.classCode);
      
      // Parent information
      submitData.append('parentInfo[name][en]', formData.parentInfo.name);
      submitData.append('parentInfo[name][si]', formData.parentInfo.name);
      submitData.append('parentInfo[phone]', formData.parentInfo.phone);
      submitData.append('parentInfo[email]', formData.parentInfo.email || '');
      submitData.append('parentInfo[address]', formData.parentInfo.address || '');
      
      // Emergency contact
      if (formData.emergencyContact) {
        submitData.append('emergencyContact', formData.emergencyContact);
      }
      
      // Profile image
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }
      
      // Image removal
      if (existingImage && !imagePreview) {
        submitData.append('removeProfileImage', 'true');
      }
      
      console.log('Submitting updated student data with values:');
      console.log(`- Full name: ${fullName}`);
      console.log(`- Date of Birth: ${formData.dateOfBirth}`);
      console.log(`- Gender: ${formData.gender}`);
      console.log(`- Age Group: ${formData.ageGroup}`);
      console.log(`- Class: ${formData.classCode} (${formData.classYear})`);
      console.log(`- Parent: ${formData.parentInfo.name}`);
      console.log(`- Phone: ${formData.parentInfo.phone}`);
      console.log(`- Image: ${profileImage ? 'New image uploaded' : 'No new image'}`);
      
      // Make the API request
      const response = await axios.put(`/api/students/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        setSuccess('Student information updated successfully');
        
        // Set a flag in localStorage to indicate the student was updated
        localStorage.setItem('studentUpdated', 'true');
        
        // Force a complete page reload after successful edit
        setTimeout(() => {
          window.location.href = `/admin/students/${id}`;
        }, 1000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
      
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.response?.data?.message || 'Failed to update student. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // UI rendering
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-300">Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link
              to={`/admin/students/${id}`}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Student
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Student Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Using M/F format for database compatibility</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Age Group
                </label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Age Group</option>
                  <option value="3-6">3-6 years (Adhiṭṭhāna)</option>
                  <option value="7-10">7-10 years (Mettā)</option>
                  <option value="11-13">11-13 years (Khanti)</option>
                  <option value="14+">14+ years (Nekkhamma)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Auto-assigned based on date of birth
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class Code
                </label>
                <select
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Class</option>
                  <option value="ADH">Adhiṭṭhāna (අධිඨාන) - White</option>
                  <option value="MET">Mettā (මෙත්තා) - Orange</option>
                  <option value="KHA">Khanti (ඛන්ති) - Yellow</option>
                  <option value="NEK">Nekkhamma (නෙක්කම්ම) - Blue</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Year
              </label>
              <input
                type="text"
                name="classYear"
                value={formData.classYear}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profile Photo
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              Parent Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Name
                </label>
                <input
                  type="text"
                  name="parentInfo.name"
                  value={formData.parentInfo.name}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="parentInfo.phone"
                  value={formData.parentInfo.phone}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="parentInfo.email"
                  value={formData.parentInfo.email}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Alternative emergency contact number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  name="parentInfo.address"
                  value={formData.parentInfo.address}
                  onChange={handleChange}
                  rows="3"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link
              to={`/admin/students/${id}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;