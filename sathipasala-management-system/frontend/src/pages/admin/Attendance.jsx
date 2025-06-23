import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isSunday, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { 
  FaCalendarAlt, FaCheck, FaSpa, FaTimes, FaSearch,
  FaExclamationCircle, FaSpinner,
  FaFileDownload, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

// Sri Lankan Poya days for 2023-2024 (monthly full moon days)
const POYA_DAYS = [
  "2023-01-06", "2023-02-05", "2023-03-07", "2023-04-05", 
  "2023-05-05", "2023-06-03", "2023-07-03", "2023-08-01",
  "2023-08-30", "2023-09-29", "2023-10-28", "2023-11-27", 
  "2023-12-26", "2024-01-25", "2024-02-24", "2024-03-25",
  "2024-04-23", "2024-05-23", "2024-06-21", "2024-07-21",
  "2024-08-19", "2024-09-17", "2024-10-17", "2024-11-15",
  "2024-12-15"
];

// Sri Lankan holidays
const HOLIDAYS = [
  { date: "2024-01-15", name: "Tamil Thai Pongal Day" },
  { date: "2024-01-25", name: "Duruthu Full Moon Poya Day" },
  { date: "2024-02-04", name: "National Day" },
  { date: "2024-02-24", name: "Navam Full Moon Poya Day" },
  { date: "2024-03-25", name: "Madin Full Moon Poya Day" },
  { date: "2024-04-13", name: "Day prior to Sinhala & Tamil New Year Day" },
  { date: "2024-04-14", name: "Sinhala & Tamil New Year Day" },
  { date: "2024-04-23", name: "Bak Full Moon Poya Day" },
  { date: "2024-05-01", name: "May Day" },
  { date: "2024-05-23", name: "Vesak Full Moon Poya Day" },
  { date: "2024-06-21", name: "Poson Full Moon Poya Day" },
  { date: "2024-07-21", name: "Esala Full Moon Poya Day" },
  { date: "2024-08-19", name: "Nikini Full Moon Poya Day" },
  { date: "2024-09-17", name: "Binara Full Moon Poya Day" },
  { date: "2024-10-17", name: "Vap Full Moon Poya Day" },
  { date: "2024-11-01", name: "Deepavali" },
  { date: "2024-11-15", name: "Il Full Moon Poya Day" },
  { date: "2024-12-15", name: "Unduvap Full Moon Poya Day" },
  { date: "2024-12-25", name: "Christmas Day" }
];

// Simple calendar component 
const SimpleCalendar = ({ selected, onChange, className }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigate to previous or next month
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  
  // Check if date is selected
  const isSelected = (date) => {
    return selected && date.getDate() === selected.getDate() && 
           date.getMonth() === selected.getMonth() && 
           date.getFullYear() === selected.getFullYear();
  };
  
  // Check special days - enhance to return more detailed information
  const isPoyaDay = (date) => POYA_DAYS.includes(format(date, 'yyyy-MM-dd'));
  const isHoliday = (date) => HOLIDAYS.some(h => h.date === format(date, 'yyyy-MM-dd'));
  const getHolidayInfo = (date) => HOLIDAYS.find(h => h.date === format(date, 'yyyy-MM-dd'));
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">&lt;</button>
        <div>{format(currentMonth, 'MMMM yyyy')}</div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">&gt;</button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 p-3">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: getDay(monthStart) }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8 w-8"></div>
        ))}
        
        {/* Calendar days */}
        {monthDays.map(day => {
          const formattedDay = format(day, 'yyyy-MM-dd');
          const isPoya = isPoyaDay(day);
          const isSun = isSunday(day);
          const isHol = isHoliday(day);
          const holiday = isHol ? getHolidayInfo(day) : null;
          const isSelDay = isSelected(day);
          
          let className = "h-8 w-8 flex items-center justify-center rounded-full text-sm cursor-pointer";
          
          // Apply different colors based on day type
          if (isSelDay) {
            className += " bg-blue-600 text-white";
          } else if (isPoya) {
            className += " bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
          } else if (isSun) {
            className += " bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
          } else if (isHol) {
            className += " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
          } else {
            className += " hover:bg-gray-100 dark:hover:bg-gray-700";
          }
          
          return (
            <div 
              key={formattedDay} 
              className={className}
              onClick={() => onChange(day)}
              title={holiday ? holiday.name : isPoya ? "Poya Day" : isSun ? "Sunday" : ""}
            >
              <div className="relative">
                {day.getDate()}
                {isPoya && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                )}
                {isHol && !isPoya && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Calendar legend for special days */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">Sunday</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">Poya</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">Holiday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceDashboard = () => {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState('ADH');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  
  const [exporting, setExporting] = useState(false);
  
  // Add missing state variables for dynamic holidays and Poya days
  const [dynamicPoyaDays, setDynamicPoyaDays] = useState([]);
  const [dynamicHolidays, setDynamicHolidays] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Year navigation controls
  const changeYear = (increment) => {
    setCurrentYear(prev => prev + increment);
  };
  
  // Enhanced function to detect Poya days based on lunar calendar calculations
  const calculatePoyaDays = (year) => {
    // Create an array to store Poya days
    const poyaDays = [];
    
    // Average length of a lunar month in days
    const lunarMonthLength = 29.53059;
    
    // Approximate full moon dates for the year
    // Note: This is a simplified calculation - for perfect accuracy, you would need
    // precise astronomical calculations or an API
    
    // First full moon of the year (approximation)
    // You may need to adjust the starting point based on known full moon date
    const knownPoyaDate = new Date(`${year}-01-06`); // January Poya (approximate)
    
    // Generate 13 Poya days (sometimes a year has 13 full moons)
    for (let i = 0; i < 13; i++) {
      const poyaDate = new Date(knownPoyaDate);
      poyaDate.setDate(knownPoyaDate.getDate() + Math.round(i * lunarMonthLength));
      
      // Skip if we've gone into the next year
      if (poyaDate.getFullYear() > year) break;
      
      poyaDays.push(format(poyaDate, 'yyyy-MM-dd'));
    }
    
    return poyaDays;
  };

  // Enhanced function to get holidays for the current year from API or calculation
  const getHolidays = async (year) => {
    // Default holidays for fallback
    const defaultHolidays = [
      { date: `${year}-01-01`, name: "New Year's Day" },
      { date: `${year}-02-04`, name: "National Day" },
      { date: `${year}-05-01`, name: "May Day" },
      { date: `${year}-12-25`, name: "Christmas Day" }
    ];
    
    // Try to fetch from API with better error handling
    try {
      console.log(`Fetching holidays for year ${year}`);
      const response = await axios.get(`/api/holidays/${year}`);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`Successfully retrieved ${response.data.data.length} holidays`);
        return response.data.data;
      }
      
      console.warn("API returned success but data format unexpected, using fallback");
      return defaultHolidays;
    } catch (error) {
      console.error("Error fetching holidays:", error);
      // For specific error status codes, you might want to show different messages
      if (error.response?.status === 404) {
        console.log("Holidays endpoint not found, using fallback data");
      }
      // Always return the default holidays so the UI doesn't break
      return defaultHolidays;
    }
  };

  // Load dynamic holidays when year changes
  useEffect(() => {
    const loadHolidaysAndPoyaDays = async () => {
      try {
        // Calculate Poya days for current year (and next year for December planning)
        const calculatedPoyaDays = [
          ...calculatePoyaDays(currentYear),
          ...calculatePoyaDays(currentYear + 1).filter(date => date.startsWith(`${currentYear + 1}-01`))
        ];
        setDynamicPoyaDays(calculatedPoyaDays);
        
        // Get holidays 
        const holidays = await getHolidays(currentYear);
        setDynamicHolidays(holidays);
      } catch (error) {
        console.error("Error loading special days:", error);
      }
    };
    
    loadHolidaysAndPoyaDays();
  }, [currentYear]);
  
  // Add a function to handle class change
  const handleClassChange = (classCode) => {
    if (classCode !== selectedClass) {
      console.log(`Switching from class ${selectedClass} to ${classCode}`);
      setSelectedClass(classCode);
      
      // Clear any previous errors/success messages
      setError(null);
      setSuccess(null);
      
      // Reset loading state
      setLoading(true);
      
      // Student data will be fetched in the useEffect hook
    }
  };
  
  // Update the useEffect to depend on selectedClass
  useEffect(() => {
    console.log(`Loading data for class: ${selectedClass}`);
    fetchStudentsForClass(selectedClass);
    
    // Also fetch attendance for current date and selected class
    if (attendanceDate) {
      fetchAttendanceForDate(attendanceDate);
    }
  }, [selectedClass, attendanceDate]); // Depend on both selectedClass and attendanceDate

  const fetchStudentsForClass = async (classCode) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching students for class: ${classCode}`);
      
      const response = await axios.get(`/api/students?classCode=${classCode}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Initialize attendance fields for each student
        const studentsWithAttendance = response.data.data.map(student => ({
          ...student,
          attendance: { status: 'present', broughtFlowers: false, notes: '' }
        }));
        
        setStudents(studentsWithAttendance);
        console.log(`Loaded ${studentsWithAttendance.length} students for class ${classCode}`);
      } else {
        setError('Failed to load students');
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('An error occurred while fetching students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log(`Fetching attendance for date ${formattedDate} and class ${selectedClass}`);
      
      const response = await axios.get(`/api/attendance/date/${formattedDate}?classCode=${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Map attendance records to students
        const attendanceMap = {};
        
        if (response.data.data && Array.isArray(response.data.data)) {
          response.data.data.forEach(record => {
            if (record.student && record.student._id) {
              attendanceMap[record.student._id] = {
                status: record.status || 'present',
                broughtFlowers: record.broughtFlowers || false,
                notes: record.notes || ''
              };
            }
          });
        }
        
        console.log(`Retrieved ${Object.keys(attendanceMap).length} attendance records for class ${selectedClass}`);
        
        // Apply attendance data to current students
        setStudents(prevStudents => 
          prevStudents.map(student => ({
            ...student,
            attendance: attendanceMap[student._id] || { 
              status: 'present', 
              broughtFlowers: false, 
              notes: '' 
            }
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      // Reset attendance data on error
      setStudents(prev => prev.map(student => ({
        ...student,
        attendance: { status: 'present', broughtFlowers: false, notes: '' }
      })));
    } finally {
      setLoading(false);
    }
  };

  // Handle attendance changes
  const handleAttendanceChange = (studentId, field, value) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student._id === studentId 
        ? {
            ...student,
            attendance: {
              ...student.attendance,
              [field]: value
            }
          }
        : student
      )
    );
  };

  const submitAttendance = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      console.log(`Submitting attendance for ${selectedClass} class on ${format(attendanceDate, 'yyyy-MM-dd')}`);
      
      // Validate date is Sunday or Poya day
      const isSelectedDaySunday = isSunday(attendanceDate);
      const isSelectedDayPoya = isPoyaDay(attendanceDate);
      
      console.log('Validation checks:', { 
        date: format(attendanceDate, 'yyyy-MM-dd'),
        isSunday: isSelectedDaySunday, 
        isPoya: isSelectedDayPoya 
      });
      
      // Validate that it's either Sunday or Poya day
      if (!isSelectedDaySunday && !isSelectedDayPoya) {
        setError('Attendance can only be marked for Sundays or Poya days. Please select a valid date.');
        setSubmitting(false);
        return;
      }
      
      // Additional check for holidays
      const isSelectedDayHoliday = isHoliday(attendanceDate);
      if (isSelectedDayHoliday && !isSelectedDayPoya) {
        // Show a confirmation dialog for holidays that aren't Poya days
        if (!window.confirm('Selected day is a holiday. Do you still want to mark attendance?')) {
          setSubmitting(false);
          return;
        }
      }
      
      // Check if there are students to submit attendance for
      if (students.length === 0) {
        setError('No students found to mark attendance for.');
        setSubmitting(false);
        return;
      }
      
      console.log(`Preparing attendance data for ${students.length} students in ${selectedClass}`);
      
      // Prepare attendance data for submission
      const attendanceData = students.map(student => {
        // Ensure each student has a valid ID
        if (!student._id) {
          console.error('Invalid student data:', student);
          throw new Error('Invalid student ID detected');
        }
        
        return {
          student: student._id,
          date: format(attendanceDate, 'yyyy-MM-dd'),
          status: student.attendance?.status || 'present',
          broughtFlowers: student.attendance?.broughtFlowers || false,
          notes: student.attendance?.notes || ''
        };
      });
      
      // Make the API request
      const response = await axios.post('/api/attendance/batch', 
        { attendance: attendanceData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // After successful submission, trigger refresh in other components
        localStorage.setItem('attendanceUpdated', 'true');
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('attendanceUpdated'));
        
        setSuccess('Attendance marked successfully!');
        
        // Refresh data to get latest state
        fetchAttendanceForDate(attendanceDate);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error submitting attendance:', err);
      
      // More detailed error handling
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An error occurred: ' + err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Export attendance data to CSV - keep function for future button implementation
  const exportAttendanceToCSV = async () => {
    try {
      setExporting(true);
      
      // Format date for filename
      const dateString = format(attendanceDate, 'yyyy-MM-dd');
      
      // Create CSV header
      let csvContent = "Student ID,Student Name,Status,Flowers Brought,Notes\n";
      
      // Add data rows
      students.forEach(student => {
        const status = student.attendance?.status || 'unknown';
        const broughtFlowers = student.attendance?.broughtFlowers ? 'Yes' : 'No';
        const notes = student.attendance?.notes || '';
        
        // Escape quotes in the notes field and wrap in quotes
        const escapedNotes = `"${notes.replace(/"/g, '""')}"`;
        
        csvContent += `${student.studentId},${student.name.en},${status},${broughtFlowers},${escapedNotes}\n`;
      });
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      // Create object URL
      const url = URL.createObjectURL(blob);
      
      // Setup download link
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${selectedClass}_${dateString}.csv`);
      link.style.visibility = 'hidden';
      
      // Add to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Attendance data exported successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error exporting attendance:', err);
      setError('Failed to export attendance data');
    } finally {
      setExporting(false);
    }
  };

  const filteredStudents = students.filter(student => {
    if (!search) return true;
    return (
      student.name.en.toLowerCase().includes(search.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const isPoyaDay = (date) => {
    return POYA_DAYS.includes(format(date, 'yyyy-MM-dd')) || dynamicPoyaDays.includes(format(date, 'yyyy-MM-dd'));
  };
  
  const isHoliday = (date) => {
    return HOLIDAYS.some(holiday => holiday.date === format(date, 'yyyy-MM-dd')) || dynamicHolidays.some(holiday => holiday.date === format(date, 'yyyy-MM-dd'));
  };
  
  const getHolidayName = (date) => {
    const holiday = HOLIDAYS.find(h => h.date === format(date, 'yyyy-MM-dd'));
    if (holiday) return holiday.name;
    
    const dynamicHoliday = dynamicHolidays.find(h => h.date === format(date, 'yyyy-MM-dd'));
    if (dynamicHoliday) return dynamicHoliday.name;
    
    if (isPoyaDay(date)) return "Poya Day";
    
    return null;
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="mb-8 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]">
        <h1 className="text-3xl font-bold mb-2">{t('admin.attendance.markAttendance')}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('admin.attendance.sundayAttendanceInfo')}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 opacity-0 animate-[slideInLeft_0.5s_ease-out_forwards]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <FaExclamationCircle className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 opacity-0 animate-[slideInLeft_0.5s_ease-out_forwards]">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <FaCheck className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">Success</p>
              <p>{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 opacity-0 animate-[fadeIn_0.5s_ease-in_0.1s_forwards]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('admin.attendance.markAttendance')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('admin.attendance.date')}: {format(attendanceDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                {/* Year navigation controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => changeYear(-1)} 
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    aria-label="Previous Year"
                  >
                    <FaChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <span className="text-sm font-medium">{currentYear}</span>
                  <button 
                    onClick={() => changeYear(1)} 
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    aria-label="Next Year"
                  >
                    <FaChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <SimpleCalendar
                selected={attendanceDate}
                onChange={(date) => {
                  if (date) {
                    setAttendanceDate(date);
                    fetchAttendanceForDate(date);
                  }
                }}
                className="rounded-md border"
              />
              
              <div className="mt-6 p-4 border rounded-md border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Selected Date Properties</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {format(attendanceDate, 'EEEE, MMMM d, yyyy')}
                </p>
                
                <div className="space-y-2">
                  {isPoyaDay(attendanceDate) && (
                    <div className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800 rounded text-xs inline-block mr-2">
                      Poya Day
                    </div>
                  )}
                  
                  {isSunday(attendanceDate) && (
                    <div className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 rounded text-xs inline-block mr-2">
                      Sunday
                    </div>
                  )}
                  
                  {isHoliday(attendanceDate) && (
                    <div className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800 rounded text-xs block mt-2">
                      Holiday: {getHolidayName(attendanceDate)}
                    </div>
                  )}
                  
                  {/* Special case: Display note when it's both Poya and Sunday */}
                  {isPoyaDay(attendanceDate) && isSunday(attendanceDate) && (
                    <div className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800 rounded text-xs block mt-2">
                      Special attendance day: Both Sunday and Poya
                    </div>
                  )}
                  
                  {!isPoyaDay(attendanceDate) && !isSunday(attendanceDate) && (
                    <div className="text-yellow-600 dark:text-yellow-500 flex items-center text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                      <FaExclamationCircle className="w-4 h-4 mr-1" />
                      <span>Not a Sunday or Poya day. Attendance cannot be marked.</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Disable button if not Sunday or Poya day */}
              <button 
                onClick={submitAttendance} 
                disabled={submitting || (!isPoyaDay(attendanceDate) && !isSunday(attendanceDate)) || students.length === 0}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2 h-4 w-4" />
                    Submit Attendance
                  </>
                )}
              </button>
            </div>
            
            {/* Removed the redundant legend here since we've added it to the calendar component */}
          </div>
          
          {/* New holiday list component */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upcoming Holidays & Poya Days
              </h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="p-4">
                <ul className="space-y-2">
                  {HOLIDAYS.filter(h => new Date(h.date) >= new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5)
                    .map(holiday => {
                      const isPoya = POYA_DAYS.includes(holiday.date);
                      return (
                        <li key={holiday.date} className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-2 ${
                              isPoya ? 'bg-purple-500' : 'bg-red-500'
                            }`}
                          ></div>
                          <div>
                            <div className="text-sm font-medium">{holiday.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(holiday.date).toLocaleDateString()}
                            </div>
                          </div>
                        </li>
                      );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 opacity-0 animate-[fadeIn_0.5s_ease-in_0.2s_forwards]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Class Attendance
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Mark attendance for {format(attendanceDate, 'MMMM d, yyyy')} - {selectedClass} class
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  {/* Update buttons to use handleClassChange */}
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button 
                      onClick={() => handleClassChange('ADH')}
                      className={`py-2 px-3 text-sm font-medium rounded-l-lg border ${selectedClass === 'ADH' 
                        ? 'bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600' 
                        : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                    >
                      Adhiṭṭhāna
                    </button>
                    <button 
                      onClick={() => handleClassChange('MET')}
                      className={`py-2 px-3 text-sm font-medium border-t border-b ${selectedClass === 'MET' 
                        ? 'bg-orange-50 text-orange-900 border-orange-300 dark:bg-orange-900/30 dark:text-orange-100 dark:border-orange-800' 
                        : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                    >
                      Mettā
                    </button>
                    <button 
                      onClick={() => handleClassChange('KHA')}
                      className={`py-2 px-3 text-sm font-medium border-t border-b ${selectedClass === 'KHA' 
                        ? 'bg-yellow-50 text-yellow-900 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-100 dark:border-yellow-800' 
                        : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                    >
                      Khanti
                    </button>
                    <button 
                      onClick={() => handleClassChange('NEK')}
                      className={`py-2 px-3 text-sm font-medium rounded-r-lg border ${selectedClass === 'NEK' 
                        ? 'bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800' 
                        : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                    >
                      Nekkhamma
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  placeholder="Search students..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="pl-10 py-2 px-3 w-full border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <button 
                  className="py-1 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => {
                    setStudents(prev => prev.map(student => ({
                      ...student,
                      attendance: { 
                        ...student.attendance, 
                        status: 'present' 
                      }
                    })));
                  }}
                >
                  Mark All Present
                </button>
                <button 
                  className="py-1 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => {
                    setStudents(prev => prev.map(student => ({
                      ...student,
                      attendance: { 
                        ...student.attendance, 
                        broughtFlowers: true
                      }
                    })));
                  }}
                >
                  All Brought Flowers
                </button>
                <button 
                  className="py-1 px-3 text-sm border border-red-300 dark:border-red-800 rounded text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={() => {
                    setStudents(prev => prev.map(student => ({
                      ...student,
                      attendance: { 
                        ...student.attendance, 
                        status: 'absent' 
                      }
                    })));
                  }}
                >
                  Mark All Absent
                </button>
              </div>
            </div>
            
            <div className="max-h-[460px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
              ) : filteredStudents.length > 0 ? (
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4">Student</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Flowers</th>
                      <th className="p-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr 
                        key={student._id} 
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 opacity-0"
                        style={{
                          animation: `slideInUp 0.3s ease-out ${index * 0.03}s forwards`
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full mr-2 overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                              {student.profileImage ? (
                                <img 
                                  src={student.profileImage.url} 
                                  alt={student.name?.en || 'Student'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                  {(student.name?.en || '?').charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{student.name?.en}</div>
                              <div className="text-xs text-gray-500">{student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              className={`h-8 w-20 rounded text-xs font-medium ${
                                student.attendance.status === 'present'
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                              onClick={() => handleAttendanceChange(student._id, 'status', 'present')}
                            >
                              <FaCheck className={`inline-block h-3 w-3 mr-1 ${student.attendance.status === 'present' ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                              Present
                            </button>
                            <button
                              className={`h-8 w-20 rounded text-xs font-medium ${
                                student.attendance.status === 'absent'
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                              onClick={() => handleAttendanceChange(student._id, 'status', 'absent')}
                            >
                              <FaTimes className={`inline-block h-3 w-3 mr-1 ${student.attendance.status === 'absent' ? 'text-white' : 'text-red-600 dark:text-red-400'}`} />
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center">
                            <input
                              id={`flowers-${student._id}`}
                              type="checkbox"
                              checked={student.attendance.broughtFlowers}
                              onChange={(e) => handleAttendanceChange(student._id, 'broughtFlowers', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:border-gray-600"
                            />
                            <label 
                              htmlFor={`flowers-${student._id}`}
                              className="ml-2 flex items-center cursor-pointer"
                            >
                              <FaSpa className={`mr-1 h-4 w-4 ${student.attendance.broughtFlowers ? 'text-pink-500' : 'text-gray-400'}`} />
                            </label>
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            placeholder="Any notes..."
                            value={student.attendance.notes || ''}
                            onChange={(e) => handleAttendanceChange(student._id, 'notes', e.target.value)}
                            className="h-8 text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center">
                  <FaExclamationCircle className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-gray-500">No students found for this class</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredStudents.length} students shown
              </div>
              <div className="flex gap-2">
                {/* Add Export button here too */}
                <button 
                  onClick={exportAttendanceToCSV}
                  disabled={exporting || students.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 flex items-center"
                >
                  {exporting ? (
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FaFileDownload className="mr-2 h-4 w-4" />
                  )}
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
                
                <button 
                  onClick={submitAttendance}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 min-w-[150px] flex items-center justify-center"
                >
                  {submitting && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;