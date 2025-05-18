import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Attendance = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState({
    classYear: new Date().getFullYear().toString(),
    classCode: 'A',
  });
  
  // Default to the nearest Sunday
  const getNextSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    
    // If today is Sunday, use today's date
    if (dayOfWeek === 0) {
      return today.toISOString().split('T')[0];
    }
    
    // Otherwise, find the next Sunday
    const daysUntilNextSunday = 7 - dayOfWeek;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilNextSunday);
    
    return nextSunday.toISOString().split('T')[0];
  };
  
  const [attendance, setAttendance] = useState({
    date: getNextSunday(),
    records: []
  });

  // Fetch students based on filter
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/students?classYear=${filter.classYear}&classCode=${filter.classCode}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        const studentsData = res.data.data || [];
        setStudents(studentsData);
        
        // Initialize attendance records for all students
        setAttendance(prev => ({
          ...prev,
          records: studentsData.map(student => ({
            studentId: student._id,
            studentName: student.name.en,
            status: 'present',
            reason: ''
          }))
        }));
        
      } catch (err) {
        console.error("Error fetching students:", err);
        // For development/testing:
        const mockStudents = Array(12).fill(0).map((_, i) => ({
          _id: `student-${i+1}`,
          studentId: `SATHI-${filter.classYear}-${filter.classCode}-${String(i+1).padStart(3, '0')}`,
          name: {
            en: `Student ${i+1}`,
            si: `සිසුවා ${i+1}`
          }
        }));
        
        setStudents(mockStudents);
        
        // Initialize attendance records for mock students
        setAttendance(prev => ({
          ...prev,
          records: mockStudents.map(student => ({
            studentId: student._id,
            studentName: student.name.en,
            status: 'present',
            reason: ''
          }))
        }));
        
        setError(err.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    
    // Check if selected date is a Sunday
    if (selectedDate.getDay() !== 0) {
      setError(t('admin.attendance.sundayRequired'));
      return;
    }
    
    setError(null);
    setAttendance(prev => ({ ...prev, date: e.target.value }));
  };

  const handleStatusChange = (studentId, value) => {
    setAttendance(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.studentId === studentId 
          ? { ...record, status: value } 
          : record
      )
    }));
  };

  const handleReasonChange = (studentId, value) => {
    setAttendance(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.studentId === studentId 
          ? { ...record, reason: value } 
          : record
      )
    }));
  };
  
  // Bulk status actions - mark all students at once
  const handleBulkStatus = (status) => {
    setAttendance(prev => ({
      ...prev,
      records: prev.records.map(record => ({
        ...record,
        status
      }))
    }));
  };
  
  // Filter students by name
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStudents = students.filter(student => 
    student.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name.si?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if selected date is a Sunday
      const selectedDate = new Date(attendance.date);
      if (selectedDate.getDay() !== 0) {
        throw new Error(t('admin.attendance.sundayRequired'));
      }
      
      // In a real implementation, you would submit attendance to your API
      /*
      const res = await axios.post('/api/attendance/bulk', attendance, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess(t('admin.attendance.markingSuccess'));
      */
      
      // For now, just simulate success
      setTimeout(() => {
        setSuccess(t('admin.attendance.markingSuccess'));
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Failed to submit attendance');
      setLoading(false);
    }
  };

  // Function to get all Sundays in the current month
  const getSundaysInCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const sundays = [];
    const date = new Date(year, month, 1);
    
    // Find first Sunday
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1);
    }
    
    // Get all Sundays in the month
    while (date.getMonth() === month) {
      sundays.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }
    
    return sundays;
  };

  const currentMonthSundays = getSundaysInCurrentMonth();
  const selectedDate = new Date(attendance.date);
  const isSelectedDateSunday = selectedDate.getDay() === 0;

  if (loading && students.length === 0) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('admin.attendance.markAttendance')}
        </h2>
        
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg">
          <div className="flex items-center">
            <span className="mr-2">ℹ️</span>
            <span>{t('admin.attendance.sundayAttendanceInfo')}</span>
          </div>
        </div>
        
        {/* Filters and Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.students.classYear')}
            </label>
            <input
              type="text"
              name="classYear"
              value={filter.classYear}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class
            </label>
            <select
              name="classCode"
              value={filter.classCode}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="ADH">Adhiṭṭhāna (අධිඨාන) - White</option>
              <option value="MET">Mettā (මෙත්තා) - Orange</option>
              <option value="KHA">Khanti (ඛන්ති) - Yellow</option>
              <option value="NEK">Nekkhamma (නෙක්කම්ම) - Blue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.date')} 
              <span className="ml-1 text-blue-600 dark:text-blue-400 text-xs font-normal">
                ({t('admin.attendance.sundaysOnly')})
              </span>
            </label>
            <input
              type="date"
              value={attendance.date}
              onChange={handleDateChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring 
                ${isSelectedDateSunday
                  ? 'border-blue-300 focus:border-blue-500 dark:border-blue-600' 
                  : 'border-red-300 focus:border-red-500 dark:border-red-600'}`}
            />
            <div className="flex items-center mt-1">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                isSelectedDateSunday
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}
                {!isSelectedDateSunday && (
                  <span className="text-red-600 ml-2 font-medium">
                    {t('admin.attendance.notSunday')}
                  </span>
                )}
              </span>
            </div>
            
            {/* Available Sundays quick selection */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.attendance.availableSundays')}:
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentMonthSundays.map(sunday => (
                  <button
                    key={sunday.toISOString()}
                    type="button"
                    onClick={() => setAttendance(prev => ({ ...prev, date: sunday.toISOString().split('T')[0] }))}
                    className={`text-xs px-2 py-1 rounded 
                      ${sunday.toISOString().split('T')[0] === attendance.date 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    {sunday.getDate()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.attendance.searchPlaceholder')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
            {success}
          </div>
        )}

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleBulkStatus('present')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {t('admin.attendance.markAllPresent')}
          </button>
          <button
            type="button"
            onClick={() => handleBulkStatus('absent')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {t('admin.attendance.markAllAbsent')}
          </button>
          <button
            type="button"
            onClick={() => handleBulkStatus('late')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            {t('admin.attendance.markAllLate')}
          </button>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            {students.length > 0 
              ? t('admin.attendance.noStudentsMatchSearch')
              : t('admin.students.noStudentsFound')}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.students.studentId')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.students.nameEnglish')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.attendance.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('admin.attendance.reason')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map((student) => {
                    const record = attendance.records.find(r => r.studentId === student._id);
                    return (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {student.name.en}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={record?.status || 'present'}
                            onChange={(e) => handleStatusChange(student._id, e.target.value)}
                            className={`px-3 py-1 border rounded focus:outline-none focus:ring ${
                              record?.status === 'present'
                                ? 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : record?.status === 'absent'
                                ? 'border-red-300 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}
                          >
                            <option value="present">{t('admin.attendance.present')}</option>
                            <option value="absent">{t('admin.attendance.absent')}</option>
                            <option value="late">{t('admin.attendance.late')}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(record?.status === 'absent' || record?.status === 'late') && (
                            <input
                              type="text"
                              value={record?.reason || ''}
                              onChange={(e) => handleReasonChange(student._id, e.target.value)}
                              placeholder={t('admin.attendance.reasonPlaceholder')}
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.attendance.studentsShown')}: {filteredStudents.length} / {students.length}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading || !isSelectedDateSunday}
                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
              >
                {loading ? t('common.submitting') : t('admin.attendance.submitAttendance')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Attendance;