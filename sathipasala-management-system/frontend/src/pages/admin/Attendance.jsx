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
  const [attendance, setAttendance] = useState({
    date: new Date().toISOString().split('T')[0],
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
        
        setStudents(res.data.data);
        
        // Initialize attendance records for all students
        setAttendance(prev => ({
          ...prev,
          records: res.data.data.map(student => ({
            studentId: student._id,
            studentName: student.name.en,
            status: 'present',
            reason: ''
          }))
        }));
        
      } catch (err) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, you would submit attendance to your API
      // const res = await axios.post('/api/attendance/bulk', attendance, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`,
      //   },
      // });

      // For now, just simulate success
      setTimeout(() => {
        setSuccess(t('admin.attendance.markingSuccess'));
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance');
      setLoading(false);
    }
  };

  if (loading && students.length === 0) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('admin.attendance.markAttendance')}
        </h2>
        
        {/* Filters and Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              {t('admin.students.classCode')}
            </label>
            <select
              name="classCode"
              value={filter.classCode}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.date')}
            </label>
            <input
              type="date"
              value={attendance.date}
              onChange={handleDateChange}
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

        {students.length === 0 ? (
          <div className="text-center p-6 text-gray-500 dark:text-gray-400">
            {t('admin.students.noStudentsFound')}
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
                  {students.map((student) => {
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
                            className="px-3 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
            
            <div className="mt-6 text-right">
              <button
                type="submit"
                disabled={loading}
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