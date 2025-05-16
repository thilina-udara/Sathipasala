import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const StudentRegistration = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: { en: '', si: '' },
    dateOfBirth: '',
    ageGroup: '3-6',
    classYear: new Date().getFullYear().toString(),
    classCode: 'A',
    parentInfo: {
      name: { en: '', si: '' },
      phone: '',
      email: '',
      address: ''
    },
    profileImage: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('name.')) {
      const key = name.split('.')[1];
      setFormData({
        ...formData,
        name: {
          ...formData.name,
          [key]: value
        }
      });
    } else if (name.startsWith('parentInfo.name.')) {
      const key = name.split('.')[2];
      setFormData({
        ...formData,
        parentInfo: {
          ...formData.parentInfo,
          name: {
            ...formData.parentInfo.name,
            [key]: value
          }
        }
      });
    } else if (name.startsWith('parentInfo.')) {
      const key = name.split('.')[1];
      setFormData({
        ...formData,
        parentInfo: {
          ...formData.parentInfo,
          [key]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/students', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({
        type: 'success',
        text: `Student registered successfully with ID: ${response.data.data.studentId}`
      });
      
      // Reset form
      setFormData({
        name: { en: '', si: '' },
        dateOfBirth: '',
        ageGroup: '3-6',
        classYear: new Date().getFullYear().toString(),
        classCode: 'A',
        parentInfo: {
          name: { en: '', si: '' },
          phone: '',
          email: '',
          address: ''
        },
        profileImage: null
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error registering student'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('admin.students.registerNewStudent')}
      </h2>

      {message.text && (
        <div 
          className={`mb-4 p-3 rounded ${
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('admin.students.studentInformation')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.nameEnglish')}
              </label>
              <input
                type="text"
                name="name.en"
                value={formData.name.en}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.nameSinhala')}
              </label>
              <input
                type="text"
                name="name.si"
                value={formData.name.si}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
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
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
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
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="3-6">3-6 {t('admin.students.years')}</option>
                <option value="7-10">7-10 {t('admin.students.years')}</option>
                <option value="11-14">11-14 {t('admin.students.years')}</option>
                <option value="15-17">15-17 {t('admin.students.years')}</option>
              </select>
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
                  {t('admin.students.classCode')}
                </label>
                <select
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('admin.students.parentInformation')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.parentNameEnglish')}
              </label>
              <input
                type="text"
                name="parentInfo.name.en"
                value={formData.parentInfo.name.en}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.students.parentNameSinhala')}
              </label>
              <input
                type="text"
                name="parentInfo.name.si"
                value={formData.parentInfo.name.si}
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
                {t('admin.students.address')}
              </label>
              <textarea
                name="parentInfo.address"
                value={formData.parentInfo.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
          >
            {loading ? t('common.submitting') : t('admin.students.registerStudent')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;