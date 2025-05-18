import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaFileCsv, FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import AttendanceChart from '../../components/charts/AttendanceChart';
import { generateAttendanceReport } from '../../utils/pdfGenerator';

const StudentAttendance = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [chartType, setChartType] = useState('pie');
  
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st of current year
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student details
        const studentResponse = await axios.get(`/api/students/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setStudent(studentResponse.data.data);
        
        // Fetch attendance history
        try {
          const attendanceResponse = await axios.get(
            `/api/attendance/student/${id}?startDate=${filters.startDate}&endDate=${filters.endDate}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          if (attendanceResponse.data.success) {
            setAttendanceData(attendanceResponse.data.data);
          } else {
            // If API returns error, fall back to mock data
            const mockData = generateMockAttendanceData(filters.startDate, filters.endDate);
            setAttendanceData(mockData);
          }
        } catch (attendanceError) {
          console.log("Attendance API not yet available, using mock data");
          // Generate mock data for development until API is ready
          const mockData = generateMockAttendanceData(filters.startDate, filters.endDate);
          setAttendanceData(mockData);
        }
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError(error.response?.data?.message || 'Failed to load student data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [id, filters.startDate, filters.endDate]);

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
    const total = attendanceData.length;
    const present = attendanceData.filter(item => item.status === 'present').length;
    const absent = attendanceData.filter(item => item.status === 'absent').length;
    const late = attendanceData.filter(item => item.status === 'late').length;
    
    const presentRate = total > 0 ? (present / total * 100).toFixed(1) : 0;
    const absentRate = total > 0 ? (absent / total * 100).toFixed(1) : 0;
    const lateRate = total > 0 ? (late / total * 100).toFixed(1) : 0;
    
    // Generate monthly attendance data for charts
    const monthlyData = {};
    
    attendanceData.forEach(record => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, present: 0, absent: 0, late: 0 };
      }
      
      monthlyData[month][record.status]++;
    });
    
    return {
      total,
      present,
      absent,
      late,
      presentRate,
      absentRate,
      lateRate,
      monthlyAttendance: Object.values(monthlyData)
    };
  };
  
  const stats = calculateStats();
  
  const handleExportCSV = () => {
    if (!student) return;
    
    // Create CSV content
    const headers = "Date,Status,Reason\n";
    const rows = attendanceData.map(item =>
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
  
  const handleExportPDF = () => {
    if (!student) return;
    generateAttendanceReport(student, attendanceData);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Student not found</p>
        <Link to="/admin/students" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Students List
        </Link>
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
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Attendance History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.name.en} • {student.studentId}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <FaFileCsv className="mr-2" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <FaFilePdf className="mr-2" />
              PDF
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('summary')}
                className={`${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`${
                  activeTab === 'records'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Attendance Records
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`${
                  activeTab === 'trends'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Attendance Trends
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Attendance Statistics
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Present</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.present} ({stats.presentRate}%)
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Absent</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.absent} ({stats.absentRate}%)
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Late</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.late} ({stats.lateRate}%)
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Classes
                  </h4>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <FaCalendarAlt className="inline mr-1" />
                    Between {new Date(filters.startDate).toLocaleDateString()} and {new Date(filters.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Chart */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Attendance Distribution
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setChartType('pie')}
                      className={`px-2 py-1 text-xs rounded ${
                        chartType === 'pie'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Pie
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-2 py-1 text-xs rounded ${
                        chartType === 'bar'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Bar
                    </button>
                  </div>
                </div>
                <AttendanceChart data={stats} chartType={chartType} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'records' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Day
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    attendanceData.map((record, index) => {
                      const date = new Date(record.date);
                      return (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {date.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : record.status === 'absent'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {record.reason || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Monthly Attendance Trends
            </h3>
            
            {stats.monthlyAttendance.length > 0 ? (
              <div className="h-80">
                <AttendanceChart data={stats} chartType="bar" />
              </div>
            ) : (
              <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                Not enough data to show monthly trends
              </div>
            )}
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              The chart shows attendance patterns across different months
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;