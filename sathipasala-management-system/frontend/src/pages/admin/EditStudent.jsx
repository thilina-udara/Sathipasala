import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import CloudinaryUpload from '../../components/common/CloudinaryUpload';

const EditStudent = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for form data
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

  // State for image handling
  const [profileImageData, setProfileImageData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load existing student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/students/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          const student = response.data.data;
          
          // Debug
          console.log("Loaded student data:", student);
          
          // Set form data
          setFormData({
            firstName: student.name?.en?.split(' ')[0] || '',
            lastName: student.name?.en?.split(' ').slice(1).join(' ') || '',
            dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
            gender: student.gender || '',
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

          // Set existing image
          if (student.profileImage?.url) {
            console.log("Setting existing image:", student.profileImage);
            setImagePreview(student.profileImage.url);
            setExistingImage(student.profileImage);
          }
        }
      } catch (err) {
        console.error('Error fetching student:', err);
        setError(err.response?.data?.message || 'Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  // Handle Cloudinary upload success
  const handleImageUploadSuccess = (uploadData) => {
    console.log('Image uploaded successfully to Cloudinary:', uploadData);
    
    // Save Cloudinary data AND set preview URL
    setProfileImageData(uploadData);
    setImagePreview(uploadData.url);
    setError(null);
  };

  // Handle Cloudinary upload error
  const handleImageUploadError = (error) => {
    console.error('Cloudinary upload error:', error);
    setError(error);
  };

  // Remove image
  const handleRemoveImage = () => {
    console.log('Removing image preview and data');
    setProfileImageData(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create JSON object for submission
      const submitData = {
        name: {
          en: `${formData.firstName} ${formData.lastName}`.trim(),
          si: formData.firstName
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
          address: formData.parentInfo.address || ''
        },
        emergencyContact: formData.emergencyContact || ''
      };

      // Handle image updates
      if (profileImageData) {
        // New image uploaded via Cloudinary
        console.log('Adding new image data to submission:', profileImageData);
        submitData.profileImage = {
          url: profileImageData.url,
          public_id: profileImageData.public_id,
          filename: profileImageData.filename
        };
      } else if (!imagePreview && existingImage) {
        // Image was removed
        console.log('Marking image for removal');
        submitData.removeProfileImage = 'true';
      }
      // If imagePreview exists but no new profileImageData, keep existing image

      console.log('Submitting update data:', submitData);
      
      const response = await axios.put(`/api/students/${id}`, submitData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Student information updated successfully');
        localStorage.setItem('studentUpdated', 'true');
        
        setTimeout(() => {
          navigate(`/admin/students/${id}`);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('parentInfo.')) {
      const field = name.replace('parentInfo.', '');
      setFormData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Student</h1>
          <button 
            onClick={() => navigate(`/admin/students/${id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            <FaArrowLeft className="mr-2 -ml-1 h-4 w-4" />
            Back to Student
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 border border-green-300 bg-green-50 rounded-md">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
               
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Age Group *
                </label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Age Group</option>
                  <option value="3-6">3-6 years</option>
                  <option value="7-10">7-10 years</option>
                  <option value="11-13">11-13 years</option>
                  <option value="14+">14+ years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class *
                </label>
                <select
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Class</option>
                  <option value="ADH">ADH - Adhiṭṭhāna</option>
                  <option value="MET">MET - Mettā</option>
                  <option value="KHA">KHA - Khanti</option>
                  <option value="NEK">NEK - Nekkhamma</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Profile Photo
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profile Photo (Optional)
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
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600"
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
                    onUploadSuccess={handleImageUploadSuccess}
                    onUploadError={handleImageUploadError}
                    acceptedTypes="image/*"
                    maxSize={5}
                    className="ml-4"
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum 5MB, JPG, PNG or WebP format
              </p>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Parent/Guardian Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  name="parentInfo.name"
                  value={formData.parentInfo.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="parentInfo.phone"
                  value={formData.parentInfo.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="parentInfo.email"
                  value={formData.parentInfo.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  name="parentInfo.address"
                  value={formData.parentInfo.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Emergency Contact
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Additional emergency contact"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {submitting ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;