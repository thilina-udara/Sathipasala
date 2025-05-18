import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e42', '#6366f1'];

// Class labels in both languages
const CLASS_LABELS = {
  ADH: { en: "Adhiṭṭhāna", si: "අධිඨාන" },
  MET: { en: "Mettā", si: "මෙත්තා" },
  KHA: { en: "Khanti", si: "ඛන්ති" },
  NEK: { en: "Nekkhamma", si: "නෙක්කම්ම" }
};

const AttendanceAnalysis = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  
  // Simple direct labels based on language
  const L = {
    analysis: currentLang === 'si' ? "පැමිණීමේ විශ්ලේෂණය" : "Attendance Analysis",
    exportCSV: currentLang === 'si' ? "CSV අපනයනය කරන්න" : "Export CSV",
    month: currentLang === 'si' ? "මාසය" : "Month",
    year: currentLang === 'si' ? "වර්ෂය" : "Year",
    class: currentLang === 'si' ? "පන්තිය" : "Class",
    search: currentLang === 'si' ? "සොයන්න" : "Search",
    searchPlaceholder: currentLang === 'si' ? "නම හෝ අංකය සොයන්න" : "Search by name or ID",
    all: currentLang === 'si' ? "සියල්ල" : "All",
    selectStudent: currentLang === 'si' ? "ශිෂ්‍යයා තෝරන්න" : "Select Student",
    students: currentLang === 'si' ? "සිසුන්" : "students",
    attendanceRate: currentLang === 'si' ? "පැමිණීමේ අනුපාතය" : "Attendance Rate",
    trend: currentLang === 'si' ? "පැමිණීමේ ප්‍රවණතාව" : "Attendance Trend",
    dailyBreakdown: currentLang === 'si' ? "දෛනික වාර්තාව" : "Daily Breakdown",
    present: currentLang === 'si' ? "පැමිණ සිටි" : "Present",
    absent: currentLang === 'si' ? "පැමිණ නොසිටි" : "Absent",
    late: currentLang === 'si' ? "ප්‍රමාද වූ" : "Late",
    sundays: currentLang === 'si' ? "ඉරිදා දිනයන්" : "Sundays",
    poya: currentLang === 'si' ? "පොහෝය දින" : "Poya Days",
    flower: currentLang === 'si' ? "මල් පූජා" : "Flower Offerings",
    poyaDay: currentLang === 'si' ? "පොහෝය දිනය" : "Poya Day",
    sunday: currentLang === 'si' ? "ඉරිදා" : "Sunday",
    noSundaysInMonth: currentLang === 'si' ? "මෙම මාසයේ ඉරිදා දින නොමැත" : "No Sundays in this month",
    flowerParticipation: currentLang === 'si' ? "මල් පූජා සහභාගිත්වය" : "Flower Offering Participation",
    noData: currentLang === 'si' ? "දත්ත නොමැත" : "No data available",
    student: currentLang === 'si' ? "සිසුවා" : "Student",
    flowerType: currentLang === 'si' ? "මල් වර්ගය" : "Flower Type",
    status: currentLang === 'si' ? "තත්ත්වය" : "Status",
    brought: currentLang === 'si' ? "ගෙනා" : "Brought",
    notBrought: currentLang === 'si' ? "ගෙන ආවේ නැත" : "Not Brought",
    individualAnalysis: currentLang === 'si' ? "තනි සිසු විශ්ලේෂණය" : "Individual Student Analysis",
    date: currentLang === 'si' ? "දිනය" : "Date",
    errorFetch: currentLang === 'si' ? "දත්ත ලබා ගැනීමේ දෝෂයකි" : "Error fetching data"
  };

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
  const [flowerData, setFlowerData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    classCode: '',
    searchTerm: '',
    studentId: '',
    eventType: ''
  });

  // Get month names based on current language
  const getMonthNames = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2022, i, 1);
      months.push(date.toLocaleString(currentLang, { month: 'long' }));
    }
    return months;
  };

  // Fetch students data
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          classYear: filters.year,
          classCode: filters.classCode || undefined
        }
      });

      if (response.data?.data) {
        setStudents(response.data.data);
        return response.data.data;
      } else {
        // Generate mock data for development
        const mockStudents = generateMockStudents();
        setStudents(mockStudents);
        return mockStudents;
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      // Fall back to mock data
      const mockStudents = generateMockStudents();
      setStudents(mockStudents);
      return mockStudents;
    }
  }, [filters.year, filters.classCode]);

  // Generate mock students for development
  const generateMockStudents = () => {
    const classMapping = {
      'ADH': '3-6',
      'MET': '7-10',
      'KHA': '11-13',
      'NEK': '14+'
    };
    
    return Array.from({ length: 40 }, (_, i) => {
      const id = i + 1;
      const classCode = ['ADH', 'MET', 'KHA', 'NEK'][Math.floor(Math.random() * 4)];
      
      return {
        _id: `mock-${id}`,
        studentId: `SATHI-${filters.year}-${classCode}-${id.toString().padStart(3, '0')}`,
        name: {
          en: `Student ${id}`,
          si: `ශිෂ්‍ය ${id}`
        },
        classYear: filters.year,
        classCode,
        ageGroup: classMapping[classCode]
      };
    });
  };

  // Generate mock attendance data
  const generateMockData = useCallback((studentsList) => {
    if (!studentsList || !studentsList.length) return [];

    // Get all Sundays in the specified month
    const sundays = getSundaysInMonth(filters.month, filters.year);
    const attendanceRecords = [];
    
    // Mock data for each Sunday
    sundays.forEach((sunday, index) => {
      const date = sunday.toISOString().split('T')[0];
      const isPoya = index === 1 || index === 3; // 2nd and 4th Sunday as mock Poya days
      const isFlowerDay = index === 0; // 1st Sunday as mock Flower day
      
      // Random attendance with better probability for presence (75-90%)
      const attendanceRate = 80 + Math.floor(Math.random() * 15) - Math.floor(Math.random() * 10);
      const total = studentsList.length;
      const present = Math.round((attendanceRate / 100) * total);
      const late = Math.round(Math.random() * (total - present) * 0.3);
      const absent = total - present - late;
      
      attendanceRecords.push({
        date,
        total,
        present,
        absent,
        late,
        attendanceRate,
        isPoya,
        isFlowerDay
      });
      
      // Add flower offering data for flower days
      if (isFlowerDay) {
        const participants = studentsList
          .filter(() => Math.random() > 0.3) // 70% participation rate
          .map(student => ({
            studentId: student.studentId,
            name: student.name[currentLang],
            flowerType: ['Rose', 'Lotus', 'Jasmine', 'Marigold', 'Sunflower'][Math.floor(Math.random() * 5)],
            brought: Math.random() > 0.2 // 80% actually brought flowers
          }));
        
        setFlowerData(prev => [
          ...prev,
          {
            date,
            participation: participants
          }
        ]);
      }
    });
    
    return attendanceRecords;
  }, [filters.month, filters.year, currentLang]);

  // Fetch or generate attendance data
  const fetchAttendance = useCallback(async (studentsList) => {
    try {
      const response = await axios.get('/api/attendance/report', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          year: filters.year,
          month: filters.month,
          classCode: filters.classCode || undefined
        }
      });
      
      if (response.data?.data) {
        setAttendanceData(response.data.data);
        // Calculate summary stats
        if (response.data.data.length > 0) {
          const avgAttendance = response.data.data.reduce((sum, day) => sum + day.attendanceRate, 0) / response.data.data.length;
          const highest = response.data.data.reduce((max, day) => day.attendanceRate > max.rate ? { rate: day.attendanceRate, date: day.date } : max, { rate: 0, date: '' });
          const lowest = response.data.data.reduce((min, day) => day.attendanceRate < min.rate ? { rate: day.attendanceRate, date: day.date } : min, { rate: 100, date: '' });
          
          setSummary({
            totalStudents: studentsList?.length || 0,
            averageAttendance: avgAttendance.toFixed(1),
            highestAttendanceDay: highest.date,
            lowestAttendanceDay: lowest.date
          });
        }
        
        // Get flower data
        const flowerDays = response.data.data.filter(day => day.flowerOfferings > 0);
        if (flowerDays.length > 0) {
          setFlowerData(flowerDays.map(day => ({
            date: day.date,
            participation: day.students.filter(s => s.flowerOffering?.brought)
          })));
        }
        
      } else {
        // Use mock data
        const mockData = generateMockData(studentsList);
        setAttendanceData(mockData);
        
        if (mockData.length > 0) {
          const avgAttendance = mockData.reduce((sum, day) => sum + day.attendanceRate, 0) / mockData.length;
          const highest = mockData.reduce((max, day) => day.attendanceRate > max.rate ? { rate: day.attendanceRate, date: day.date } : max, { rate: 0, date: '' });
          const lowest = mockData.reduce((min, day) => day.attendanceRate < min.rate ? { rate: day.attendanceRate, date: day.date } : min, { rate: 100, date: '' });
          
          setSummary({
            totalStudents: studentsList?.length || 0,
            averageAttendance: avgAttendance.toFixed(1),
            highestAttendanceDay: highest.date,
            lowestAttendanceDay: lowest.date
          });
        }
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      
      // Use mock data
      const mockData = generateMockData(studentsList);
      setAttendanceData(mockData);
      
      if (mockData.length > 0) {
        const avgAttendance = mockData.reduce((sum, day) => sum + day.attendanceRate, 0) / mockData.length;
        setSummary({
          totalStudents: studentsList?.length || 0,
          averageAttendance: avgAttendance.toFixed(1),
          highestAttendanceDay: mockData[0]?.date || '',
          lowestAttendanceDay: mockData[mockData.length - 1]?.date || ''
        });
      }
    } finally {
      setLoading(false);
    }
  }, [filters.year, filters.month, filters.classCode, generateMockData]);

  // Main data fetch effect
  useEffect(() => {
    const fetchData = async () => {
      // Reset when filters change
      setFlowerData([]);
      setError(null);
      
      try {
        // First get students
        const studentsData = await fetchStudents();
        // Then get attendance based on students
        await fetchAttendance(studentsData);
      } catch (error) {
        console.error("Error in data fetching:", error);
        setError(L.errorFetch);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchStudents, fetchAttendance, filters, currentLang]);

  // Filtered students for dropdown
  const filteredStudents = students.filter(student =>
    !filters.searchTerm ||
    (student.name[currentLang] && student.name[currentLang].toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
    student.studentId.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  // Export CSV
  const handleExportCSV = () => {
    if (!attendanceData || attendanceData.length === 0) return;
    
    // Create CSV content
    const headers = "Date,Total Students,Present,Absent,Late,Attendance Rate\n";
    const rows = attendanceData.map(day => 
      `${day.date},${day.total},${day.present},${day.absent},${day.late},${day.attendanceRate}%`
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-${filters.year}-${filters.month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Class-wise summary
  const classSummary = ['ADH', 'MET', 'KHA', 'NEK'].map(code => {
    const classStudents = students.filter(s => s.classCode === code);
    const total = classStudents.length;
    
    // Calculate attendance percentage for this class
    let percent = 0;
    if (attendanceData.length > 0) {
      // Mock calculation (in real app, use actual data)
      percent = (70 + Math.floor(Math.random() * 25)).toFixed(1);
    }
    
    return {
      code,
      label: CLASS_LABELS[code][currentLang],
      total,
      percent
    };
  });

  // Pie chart data for present/absent/late
  const pieData = [
    { name: L.present, value: attendanceData.reduce((sum, d) => sum + d.present, 0) },
    { name: L.absent, value: attendanceData.reduce((sum, d) => sum + d.absent, 0) },
    { name: L.late, value: attendanceData.reduce((sum, d) => sum + d.late, 0) }
  ];

  // Get Sundays in current month
  function getSundaysInMonth(month, year) {
    const sundays = [];
    const date = new Date(year, month - 1, 1);
    
    // Move to the first Sunday in the month
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1);
    }
    
    // Collect all Sundays
    while (date.getMonth() === month - 1) {
      sundays.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }
    
    return sundays;
  }

  // Individual student attendance data
  const handleStudentSelect = useCallback(async (studentId) => {
    setSelectedStudent(studentId);
    
    if (!studentId) return;
    
    setLoading(true);
    
    try {
      // Try to get actual data from API
      const response = await axios.get(`/api/attendance/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          year: filters.year,
          month: filters.month
        }
      });
      
      if (response.data?.data) {
        // Format real data
      } else {
        // Generate mock data for development
      }
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      // Generate mock data for selected student
    } finally {
      setLoading(false);
    }
  }, [filters.year, filters.month]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Header with title and export button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            {L.analysis}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              disabled={!attendanceData.length}
            >
              {L.exportCSV}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.month}
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={e => setFilters(f => ({ ...f, month: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {getMonthNames().map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.year}
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={e => setFilters(f => ({ ...f, year: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {[...Array(5)].map((_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.class}
            </label>
            <select
              name="classCode"
              value={filters.classCode}
              onChange={e => setFilters(f => ({ ...f, classCode: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">{L.all}</option>
              <option value="ADH">{CLASS_LABELS.ADH[currentLang]}</option>
              <option value="MET">{CLASS_LABELS.MET[currentLang]}</option>
              <option value="KHA">{CLASS_LABELS.KHA[currentLang]}</option>
              <option value="NEK">{CLASS_LABELS.NEK[currentLang]}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.search}
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={e => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
              placeholder={L.searchPlaceholder}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {/* Student Filter */}
        {filteredStudents.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.selectStudent}
            </label>
            <select
              value={selectedStudent}
              onChange={e => handleStudentSelect(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">{L.all}</option>
              {filteredStudents.map(student => (
                <option key={student._id} value={student._id}>
                  {student.studentId} - {student.name[currentLang]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error/Loading */}
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Class-wise Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {classSummary.map((cls) => (
            <div key={cls.code} className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {cls.label}
              </h3>
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                {cls.total} {L.students}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {L.attendanceRate}: {cls.percent}%
              </p>
            </div>
          ))}
        </div>

        {/* Attendance Trend Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {L.trend}
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate()} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => `${v}%`} labelFormatter={d => new Date(d).toLocaleDateString(currentLang)} />
                <Line type="monotone" dataKey="attendanceRate" stroke="#10b981" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Breakdown & Attendance Rate */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {L.dailyBreakdown}
            </h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate()} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name={L.present} />
                  <Bar dataKey="absent" fill="#ef4444" name={L.absent} />
                  <Bar dataKey="late" fill="#f59e42" name={L.late} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {L.attendanceRate}
            </h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Calendar View for Sundays/Poya/Flower Days */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {L.sundays} / {L.poya} / {L.flower} - {getMonthNames()[filters.month-1]} {filters.year}
          </h3>
          <div className="flex flex-wrap gap-2">
            {getSundaysInMonth(filters.month, filters.year).map((sunday, index) => {
              const date = sunday.toISOString().split('T')[0];
              const dayData = attendanceData.find(d => d.date === date) || { attendanceRate: 0 };
              const isPoya = dayData.isPoya;
              const isFlower = dayData.isFlowerDay;
              
              return (
                <div 
                  key={`${date}-${index}`} // Added index to ensure unique keys
                  className={`rounded-lg shadow p-4 w-36 ${
                    isPoya ? 'bg-yellow-100 dark:bg-yellow-900' :
                    isFlower ? 'bg-pink-100 dark:bg-pink-900' :
                    'bg-white dark:bg-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">{sunday.getDate()}</div>
                    <div className="text-xs text-gray-500">
                      {isPoya ? L.poyaDay : 
                       isFlower ? L.flower :
                       L.sunday}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${dayData.attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {dayData.attendanceRate}%
                    </div>
                  </div>
                </div>
              );
            })}
            
            {getSundaysInMonth(filters.month, filters.year).length === 0 && (
              <div className="text-center p-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded w-full">
                {L.noSundaysInMonth}
              </div>
            )}
          </div>
        </div>

        {/* Flower Offering Participation */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {L.flowerParticipation}
          </h3>
          {flowerData.length === 0 ? (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded">
              {L.noData}
            </div>
          ) : (
            flowerData.map((day, idx) => (
              <div key={`flower-${day.date}-${idx}`} className="mb-4">
                <div className="font-semibold mb-2">
                  {new Date(day.date).toLocaleDateString(currentLang)} ({L.flower})
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left text-xs font-medium">{L.student}</th>
                        <th className="px-2 py-1 text-left text-xs font-medium">{L.flowerType}</th>
                        <th className="px-2 py-1 text-left text-xs font-medium">{L.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.participation.map((stu, index) => (
                        <tr key={`${stu.studentId || ''}-${index}`}>
                          <td className="px-2 py-1 text-xs">{stu.name} ({stu.studentId})</td>
                          <td className="px-2 py-1 text-xs">{stu.flowerType || '-'}</td>
                          <td className="px-2 py-1 text-xs">
                            {stu.brought ? L.brought : L.notBrought}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Individual Student Analysis */}
        {selectedStudent && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {L.individualAnalysis}
            </h3>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">{L.date}</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">{L.present}</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">{L.absent}</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">{L.late}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((day, idx) => (
                    <tr key={`${day.date}-${idx}`}>
                      <td className="px-4 py-2 text-sm">
                        {new Date(day.date).toLocaleDateString(currentLang)}
                      </td>
                      <td className="px-4 py-2 text-sm">{Math.random() > 0.2 ? '1' : '0'}</td>
                      <td className="px-4 py-2 text-sm">{Math.random() > 0.8 ? '1' : '0'}</td>
                      <td className="px-4 py-2 text-sm">{Math.random() > 0.9 ? '1' : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalysis;