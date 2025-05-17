import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const StudentAttendance = () => {
  const { studentId } = useParams();
  const { t } = useTranslation();
  const [student, setStudent] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st of current year
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student details
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setStudent(studentResponse.data.data);
        
        // Fetch attendance history
        const attendanceResponse = await axios.get(
          `/api/attendance/student/${studentId}?startDate=${filters.startDate}&endDate=${filters.endDate}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        // If API doesn't return data yet, generate mock data for development
        if (!attendanceResponse.data || !attendanceResponse.data.data) {
          const mockData = generateMockAttendanceData(filters.startDate, filters.endDate);
          setAttendanceHistory(mockData);
        } else {
          setAttendanceHistory(attendanceResponse.data.data);
        }
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError(error.response?.data?.message || 'Failed to load student data');
        
        // Generate mock data for development
        const mockStudent = {
          _id: studentId,
          studentId: 'SATHI-2023-A-001',
          name: {
            en: 'Sample Student',
            si: 'නියැදි සිසුවා'
          },
          dateOfBirth: '2015-05-15',
          ageGroup: '7-10',
          classYear: '2023',
          classCode: 'A',
          parentInfo: {
            name: {
              en: 'Parent Name',
              si: 'දෙමාපිය නම'
            },
            phone: '0771234567',
            email: 'parent@example.com'
          }
        };
        
        setStudent(mockStudent);
        
        const mockData = generateMockAttendanceData(filters.startDate, filters.endDate);
        setAttendanceHistory(mockData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [studentId, filters.startDate, filters.endDate]);

  // Generate mock attendance data for development
  const generateMockAttendanceData = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const attendanceData = [];
    
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Only include Sundays
      if (currentDate.getDay() === 0) {
        // Random attendance status
        const random = Math.random();
        let status;
        let reason = '';
        
        if (random < 0.75) {
          status = 'present';
        } else if (random < 0.9) {
          status = 'absent';
          reason = 'Sick leave';
        } else {
          status = 'late';
          reason = 'Traffic delay';
        }
        
        attendanceData.push({
          date: new Date(currentDate).toISOString().split('T')[0],
          status,
          reason
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return attendanceData;
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Calculate statistics
  const calculateStats = () => {
    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(item => item.status === 'present').length;
    const absent = attendanceHistory.filter(item => item.status === 'absent').length;
    const late = attendanceHistory.filter(item => item.status === 'late').length;
    
    const presentRate = total > 0 ? (present / total * 100).toFixed(1) : 0;
    const absentRate = total > 0 ? (absent / total * 100).toFixed(1) : 0;
    const lateRate = total > 0 ? (late / total * 100).toFixed(1) : 0;
    
    return {
      total,
      present,
      absent,
      late,
      presentRate,
      absentRate,
      lateRate
    };
  };
  
  const stats = calculateStats();
  
  const handleExportCSV = () => {
    if (!student) return;
    
    // Create CSV content
    const headers = "Date,Status,Reason\n";
    const rows = attendanceHistory.map(item =>
      `${item.date},${item.status},${item.reason || ''}`
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${student.studentId}-attendance.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
        {error}
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="p-6 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded">
        {t('admin.students.studentNotFound')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('admin.attendance.studentAttendance')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {student.name.en} ({student.studentId})
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              {t('admin.export.csv')}
            </button>
          </div>
        </div>
        
        {/* Student Info */}
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.students.name')}
              </h3>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {student.name.en}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.name.si}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.students.class')}
              </h3>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {student.classYear}-{student.classCode}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.ageGroup} {t('admin.students.years')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.students.dateOfBirth')}
              </h3>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {new Date(student.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.students.contact')}
              </h3>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {student.parentInfo.phone}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.parentInfo.name.en}
              </p>
            </div>
          </div>
        </div>
        
        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.startDate')}
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.endDate')}
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        
        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.present')}
            </h3>
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              {stats.present} ({stats.presentRate}%)
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.absent')}
            </h3>
            <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              {stats.absent} ({stats.absentRate}%)
            </p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.late')}
            </h3>
            <p className="text-lg font-semibold text-red-800 dark:text-red-200">
              {stats.late} ({stats.lateRate}%)
            </p>
          </div>
        </div>
        
        {/* Attendance Table */}
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.attendance.date')}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.attendance.status')}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('admin.attendance.reason')}
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {attendanceHistory.map((item) => (
                <tr key={item.date}>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'present'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : item.status === 'absent'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {t(`admin.attendance.${item.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {item.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;