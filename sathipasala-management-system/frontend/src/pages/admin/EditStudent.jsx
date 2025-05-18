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
  
  // Student form data - no sinhalaName field
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
  
  // For image handling
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  
  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/students/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const student = response.data.data;
        
        // Parse student name into first and last name
        const nameParts = student.name.en.split(' ');
        const lastName = nameParts.pop() || '';
        const firstName = nameParts.join(' ');
        
        setFormData({
          firstName,
          lastName,
          dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
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
    
    let ageGroup;
    if (age >= 0 && age <= 6) {
      ageGroup = '3-6';
      setFormData(prev => ({...prev, classCode: 'ADH'}));
    } else if (age >= 7 && age <= 10) {
      ageGroup = '7-10';
      setFormData(prev => ({...prev, classCode: 'MET'}));
    } else if (age >= 11 && age <= 13) {
      ageGroup = '11-13';
      setFormData(prev => ({...prev, classCode: 'KHA'}));
    } else if (age >= 14) {
      ageGroup = '14+';
      setFormData(prev => ({...prev, classCode: 'NEK'}));
    }
    
    setFormData(prev => ({...prev, ageGroup}));
  };
  
  // Modify the handleChange function
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
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError(t('common.errors.invalidImageType'));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError(t('common.errors.imageTooLarge'));
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
  
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create FormData object for multipart/form-data submission
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('name[en]', `${formData.firstName} ${formData.lastName}`);
      // Use the same name for Sinhala (as requested)
      submitData.append('name[si]', `${formData.firstName} ${formData.lastName}`);
      
      submitData.append('dateOfBirth', formData.dateOfBirth);
      submitData.append('gender', formData.gender);
      submitData.append('ageGroup', formData.ageGroup);
      submitData.append('classYear', formData.classYear);
      submitData.append('classCode', formData.classCode);
      
      // Parent info
      submitData.append('parentInfo[name][en]', formData.parentInfo.name);
      submitData.append('parentInfo[name][si]', formData.parentInfo.name);
      submitData.append('parentInfo[phone]', formData.parentInfo.phone);
      submitData.append('parentInfo[email]', formData.parentInfo.email);
      submitData.append('parentInfo[address]', formData.parentInfo.address);
      
      // Emergency contact
      if (formData.emergencyContact) {
        submitData.append('emergencyContact', formData.emergencyContact);
      }
      
      // Add profile image if changed
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }
      
      // Flag to indicate if image was removed
      if (existingImage && !imagePreview) {
        submitData.append('removeProfileImage', 'true');
      }
      
      // Send update request
      const response = await axios.put(`/api/students/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess(t('admin.students.updateSuccess'));
      
      // Navigate back to student details after short delay
      setTimeout(() => {
        navigate(`/admin/students/${id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.response?.data?.message || 'Failed to update student information');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              {t('admin.students.studentInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {/* No Sinhala Name field */}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.dateOfBirth')}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.gender')}
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">{t('admin.students.selectGender')}</option>
                  <option value="M">{t('admin.students.male')}</option>
                  <option value="F">{t('admin.students.female')}</option>
                  <option value="O">{t('admin.students.other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.ageGroup')}
                </label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">{t('Select Age Group')}</option>
                  <option value="3-6">{t('ageGroups.3-6')}</option>
                  <option value="7-10">{t('ageGroups.7-10')}</option>
                  <option value="11-13">{t('ageGroups.11-13')}</option>
                  <option value="14+">{t('ageGroups.14+')}</option>
                </select>
              </div>
              
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
                  placeholder="E.g., 2023"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.classCode')}
                </label>
                <select
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">{t('Select Class')}</option>
                  <option value="ADH">{t('classes.ADH.name')} ({t('classes.ADH.nameSi')})</option>
                  <option value="MET">{t('classes.MET.name')} ({t('classes.MET.nameSi')})</option>
                  <option value="KHA">{t('classes.KHA.name')} ({t('classes.KHA.nameSi')})</option>
                  <option value="NEK">{t('classes.NEK.name')} ({t('classes.NEK.nameSi')})</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('admin.students.profilePhoto')}
            </h3>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-32 h-32 relative border rounded overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Student Preview" 
                    className="max-w-full max-h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-6xl">
                    {formData.firstName.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Upload Controls */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                />
                
                <div className="flex flex-col space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {imagePreview ? t('changeImage') : t('selectImage')}
                  </button>
                  
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      {t('removeImage')}
                    </button>
                  )}
                </div>
                
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('admin.students.parentInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.parentName')}
                </label>
                <input
                  type="text"
                  name="parentInfo.name"
                  value={formData.parentInfo.name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.parentPhone')}
                </label>
                <input
                  type="text"
                  name="parentInfo.phone"
                  value={formData.parentInfo.phone}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.emergencyContact')}
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.students.address')}
                </label>
                <textarea
                  name="parentInfo.address"
                  value={formData.parentInfo.address}
                  onChange={handleChange}
                  rows={3}
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
              {submitting ? t('common.submitting') : (
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