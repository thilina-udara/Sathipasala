import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AttendanceAnalysis = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    highestAttendanceDay: '',
    lowestAttendanceDay: '',
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [filters, setFilters] = useState({
    month: currentMonth,
    year: currentYear,
    classYear: '',
    classCode: '',
    studentId: '',
    searchTerm: ''
  });

  const fetchStudents = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.classYear) queryParams.append('classYear', filters.classYear);
      if (filters.classCode) queryParams.append('classCode', filters.classCode);
      
      const res = await axios.get(`/api/students?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const studentsData = res.data.data || [];
      setStudents(studentsData);
      return studentsData;
    } catch (error) {
      console.error("Error fetching students:", error);
      
      // For development/demonstration
      const mockStudents = Array(15).fill(0).map((_, i) => ({
        _id: `student-${i+1}`,
        studentId: `SATHI-${filters.year}-${['A', 'B', 'C'][i % 3]}-${String(i+1).padStart(3, '0')}`,
        name: { 
          en: `Student ${i+1}`, 
          si: `සිසුවා ${i+1}` 
        },
        classYear: filters.year || '2023',
        classCode: ['A', 'B', 'C'][i % 3]
      }));
      setStudents(mockStudents);
      return mockStudents;
    }
  }, [filters.classYear, filters.classCode]);

  const fetchAttendanceData = useCallback(async (studentsList) => {
    try {
      const sundays = getSundaysInMonth(filters.month, filters.year);
      
      if (sundays.length === 0) {
        setAttendanceData([]);
        setSummary({
          totalStudents: studentsList.length,
          averageAttendance: 0,
          highestAttendanceDay: t('admin.attendance.noSundays'),
          lowestAttendanceDay: t('admin.attendance.noSundays')
        });
        return;
      }
      
      // Prepare query parameters
      let queryParams = new URLSearchParams();
      queryParams.append('month', filters.month);
      queryParams.append('year', filters.year);
      
      if (filters.classYear) queryParams.append('classYear', filters.classYear);
      if (filters.classCode) queryParams.append('classCode', filters.classCode);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      
      // In a production environment, you would fetch real data:
      /*
      const res = await axios.get(`/api/attendance/monthly?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const attendanceData = res.data.data;
      setAttendanceData(attendanceData);
      */
      
      // For development/demonstration, generate mock data
      const mockData = generateMockData(sundays, filters.month, filters.year, studentsList);
      setAttendanceData(mockData);
      
      // Calculate and set summary statistics
      calculateAndSetSummary(mockData, studentsList.length);
      
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      
      // For development/demonstration
      const sundays = getSundaysInMonth(filters.month, filters.year);
      const mockData = generateMockData(sundays, filters.month, filters.year, students);
      setAttendanceData(mockData);
      
      // Calculate and set summary statistics
      calculateAndSetSummary(mockData, students.length);
    }
  }, [filters, students]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        await fetchStudents();
        await fetchAttendanceData();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchStudents, fetchAttendanceData]);

  // Get all Sundays in the selected month/year
  const getSundaysInMonth = (month, year) => {
    const sundays = [];
    const date = new Date(year, month - 1, 1);
    
    // Find first Sunday
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1);
    }
    
    // Get all Sundays in the month
    while (date.getMonth() === month - 1) {
      sundays.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }
    
    return sundays;
  };
  
  // Calculate and set summary statistics
  const calculateAndSetSummary = (attendanceData, totalStudentCount) => {
    if (!attendanceData?.dailyAttendance) return;
    
    let totalPresent = 0;
    let highestDay = { date: '', count: 0 };
    let lowestDay = { date: '', count: totalStudentCount };
    
    Object.entries(attendanceData.dailyAttendance).forEach(([date, data]) => {
      totalPresent += data.presentCount || 0;
      
      if ((data.presentCount || 0) > highestDay.count) {
        highestDay = { date, count: data.presentCount || 0 };
      }
      
      if ((data.presentCount || 0) < lowestDay.count && Object.keys(attendanceData.dailyAttendance).length > 1) {
        lowestDay = { date, count: data.presentCount || 0 };
      }
    });
    
    const daysCount = Object.keys(attendanceData.dailyAttendance).length;
    const averageAttendance = daysCount > 0 
      ? (totalPresent / (daysCount * totalStudentCount) * 100).toFixed(1) 
      : 0;
    
    setSummary({
      totalStudents: totalStudentCount,
      averageAttendance,
      highestAttendanceDay: highestDay.date 
        ? `${new Date(highestDay.date).toLocaleDateString()} (${highestDay.count} ${t('admin.students')})`
        : t('admin.attendance.noData'),
      lowestAttendanceDay: lowestDay.date 
        ? `${new Date(lowestDay.date).toLocaleDateString()} (${lowestDay.count} ${t('admin.students')})`
        : t('admin.attendance.noData')
    });
  };

  // Function to generate realistic mock data for Sunday-only classes
  const generateMockData = (sundays, month, year, studentsList) => {
    const mockDailyAttendance = {};
    const totalStudentCount = studentsList.length;
    
    sundays.forEach(sunday => {
      const dateStr = sunday.toISOString().split('T')[0];
      
      // Generate student-specific attendance data
      const studentAttendance = {};
      studentsList.forEach(student => {
        // Randomize attendance: 80% chance of present, 10% late, 10% absent
        const rand = Math.random();
        const status = rand < 0.8 ? 'present' : (rand < 0.9 ? 'late' : 'absent');
        
        studentAttendance[student._id] = {
          status,
          reason: status !== 'present' ? ['Sick', 'Family event', 'Unknown'][Math.floor(Math.random() * 3)] : ''
        };
      });
      
      // Count statistics
      const presentCount = Object.values(studentAttendance).filter(a => a.status === 'present').length;
      const absentCount = Object.values(studentAttendance).filter(a => a.status === 'absent').length;
      const lateCount = Object.values(studentAttendance).filter(a => a.status === 'late').length;
      
      mockDailyAttendance[dateStr] = {
        date: dateStr,
        totalCount: totalStudentCount,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate: totalStudentCount > 0 ? ((presentCount / totalStudentCount) * 100).toFixed(1) : '0',
        studentAttendance
      };
    });
    
    return {
      month,
      year,
      totalStudents: totalStudentCount,
      dailyAttendance: mockDailyAttendance,
      students: studentsList.map(s => ({
        id: s._id,
        studentId: s.studentId,
        name: s.name
      }))
    };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    setFilters(prev => ({ ...prev, studentId: selectedId }));
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleExportCSV = () => {
    if (!attendanceData?.dailyAttendance) return;
    
    // Create CSV header row
    const headers = ["Date", "Total Students", "Present", "Absent", "Late", "Attendance Rate"];
    
    // If a specific student is selected, add their details to the header
    const selectedStudent = filters.studentId ? students.find(s => s._id === filters.studentId) : null;
    if (selectedStudent) {
      headers[0] = `Date (Student: ${selectedStudent.studentId} - ${selectedStudent.name.en})`;
    }
    
    // Create CSV content
    const headerRow = headers.join(",");
    const dataRows = Object.values(attendanceData.dailyAttendance).map(day => {
      const row = [
        new Date(day.date).toLocaleDateString(),
        day.totalCount,
        day.presentCount,
        day.absentCount,
        day.lateCount,
        `${day.attendanceRate}%`
      ];
      return row.join(",");
    }).join("\n");
    
    const csvContent = `${headerRow}\n${dataRows}`;
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-${filters.year}-${String(filters.month).padStart(2, '0')}${selectedStudent ? '-' + selectedStudent.studentId : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const filteredStudents = students.filter(student => 
    !filters.searchTerm || 
    student.name.en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    student.name.si?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
            Monthly Attendance Analysis
            <span className="ml-2 text-sm font-normal text-blue-600">
              (Sundays Only)
            </span>
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              disabled={!attendanceData?.dailyAttendance || Object.keys(attendanceData.dailyAttendance).length === 0}
            >
              {t('admin.export.csv')}
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.month')}
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {t(`admin.months.${month.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.year')}
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {[...Array(5)].map((_, i) => (
                <option key={i} value={currentYear - i}>
                  {currentYear - i}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class
            </label>
            <select
              name="classCode"
              value={filters.classCode}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">All Classes</option>
              <option value="ADH">Adhiṭṭhāna (අධිඨාන)</option>
              <option value="MET">Mettā (මෙත්තා)</option>
              <option value="KHA">Khanti (ඛන්ති)</option>
              <option value="NEK">Nekkhamma (නෙක්කම්ම)</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.search')}
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={handleSearch}
              placeholder={t('admin.attendance.searchPlaceholder')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {filteredStudents.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.students.selectStudent')}
            </label>
            <select
              value={filters.studentId}
              onChange={handleStudentSelect}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">{t('admin.filters.all')}</option>
              {filteredStudents.map(student => (
                <option key={student._id} value={student._id}>
                  {student.studentId} - {student.name.en}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
            {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.totalStudents')}
            </h3>
            <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              {summary.totalStudents}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.averageAttendance')}
            </h3>
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              {summary.averageAttendance}%
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.highestAttendance')}
            </h3>
            <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
              {summary.highestAttendanceDay}
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.attendance.lowestAttendance')}
            </h3>
            <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              {summary.lowestAttendanceDay}
            </p>
          </div>
        </div>
        
        {/* Sundays Calendar for selected month */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('admin.attendance.sundays')} - {t(`admin.months.${months[filters.month-1].toLowerCase()}`)} {filters.year}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {getSundaysInMonth(filters.month, filters.year).map((sunday) => {
              const dateStr = sunday.toISOString().split('T')[0];
              const dayData = attendanceData.dailyAttendance?.[dateStr];
              const attendanceRate = dayData ? dayData.attendanceRate : '0';
              
              return (
                <div key={dateStr} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 w-32">
                  <div className="text-center">
                    <div className="text-sm font-medium">{sunday.getDate()}</div>
                    <div className="text-xs text-gray-500">Sunday</div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {attendanceRate}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {getSundaysInMonth(filters.month, filters.year).length === 0 && (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded">
              {t('admin.attendance.noSundaysInMonth')}
            </div>
          )}
        </div>
        
        {/* Daily Breakdown Table */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('admin.attendance.dailyBreakdown')}
          </h3>
          
          {!loading && attendanceData?.dailyAttendance && Object.keys(attendanceData.dailyAttendance).length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.attendance.date')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.attendance.totalStudents')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.attendance.present')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.attendance.absent')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.attendance.late')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.attendance.attendanceRate')}
                    </th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.values(attendanceData.dailyAttendance)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(day => (
                      <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {new Date(day.date).toLocaleDateString()}
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                            {t('admin.attendance.sunday')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {day.totalCount}
                        </td>
                        <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400">
                          {day.presentCount}
                        </td>
                        <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                          {day.absentCount}
                        </td>
                        <td className="px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400">
                          {day.lateCount}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${day.attendanceRate}%` }}
                              ></div>
                            </div>
                            <span>{day.attendanceRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : !loading ? (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded">
              {t('admin.attendance.noDataFound')}
            </div>
          ) : null}
        </div>
        
        {/* Student Details - Only show if a specific student is selected */}
        {filters.studentId && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('admin.attendance.studentDetails')}
            </h3>
            
            {(() => {
              const student = students.find(s => s._id === filters.studentId);
              if (!student) return null;
              
              const records = Object.entries(attendanceData.dailyAttendance || {}).map(([date, data]) => {
                return {
                  date,
                  status: data.studentAttendance?.[student._id]?.status || 'absent',
                  reason: data.studentAttendance?.[student._id]?.reason || ''
                };
              });
              
              const presentCount = records.filter(r => r.status === 'present').length;
              const absentCount = records.filter(r => r.status === 'absent').length;
              const lateCount = records.filter(r => r.status === 'late').length;
              const totalClasses = records.length;
              const attendanceRate = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : '0';
              
              return (
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {student.name.en}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {student.studentId}
                        </p>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('admin.attendance.present')}
                            </div>
                            <div className="text-lg font-medium text-green-600 dark:text-green-400">
                              {presentCount}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('admin.attendance.absent')}
                            </div>
                            <div className="text-lg font-medium text-red-600 dark:text-red-400">
                              {absentCount}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('admin.attendance.late')}
                            </div>
                            <div className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
                              {lateCount}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t('admin.attendance.attendanceRate')}
                            </div>
                            <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                              {attendanceRate}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
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
                        {records.sort((a, b) => new Date(a.date) - new Date(b.date)).map((record) => (
                          <tr key={record.date} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium
                                ${record.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                  record.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}
                              >
                                {t(`admin.attendance.${record.status}`)}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {record.reason || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalysis;