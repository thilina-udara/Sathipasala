import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaFileCsv, 
  FaFilePdf, 
  FaCalendarAlt, 
  FaUserAlt, 
  FaFilter,
  FaSeedling
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AttendanceReport = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    classYear: '',
    classCode: '',
    studentId: '',
    searchTerm: '',
    reportType: 'summary'
  });

  // Simple labels based on language
  const L = {
    report: currentLang === 'si' ? "පැමිණීමේ වාර්තාව" : "Attendance Report",
    exportCSV: currentLang === 'si' ? "CSV අපනයනය කරන්න" : "Export CSV",
    exportPDF: currentLang === 'si' ? "PDF අපනයනය කරන්න" : "Export PDF",
    summaryReport: currentLang === 'si' ? "සාරාංශ වාර්තාව" : "Summary Report",
    studentReport: currentLang === 'si' ? "සිසු වාර්තාව" : "Student Report",
    classReport: currentLang === 'si' ? "පන්ති වාර්තාව" : "Class Report",
    startDate: currentLang === 'si' ? "ආරම්භක දිනය" : "Start Date",
    endDate: currentLang === 'si' ? "අවසාන දිනය" : "End Date",
    classYear: currentLang === 'si' ? "පන්ති වසර" : "Class Year",
    class: currentLang === 'si' ? "පන්තිය" : "Class",
    allClasses: currentLang === 'si' ? "සියළුම පන්ති" : "All Classes",
    search: currentLang === 'si' ? "සොයන්න" : "Search",
    searchPlaceholder: currentLang === 'si' ? "නමින් හෝ ID මගින් සොයන්න" : "Search by name or ID",
    selectStudent: currentLang === 'si' ? "සිසුවා තෝරන්න" : "Select Student",
    select: currentLang === 'si' ? "තෝරන්න" : "Select",
    summary: currentLang === 'si' ? "සාරාංශය" : "Summary",
    totalDays: currentLang === 'si' ? "මුළු දින ගණන" : "Total Days",
    avgPresent: currentLang === 'si' ? "සාමාන්‍ය පැමිණීම" : "Average Present",
    avgAbsent: currentLang === 'si' ? "සාමාන්‍ය නොපැමිණීම" : "Average Absent",
    avgLate: currentLang === 'si' ? "සාමාන්‍ය ප්‍රමාද" : "Average Late",
    avgFlowers: currentLang === 'si' ? "සාමාන්‍ය මල් පූජා" : "Average Flowers",
    date: currentLang === 'si' ? "දිනය" : "Date",
    totalStudents: currentLang === 'si' ? "මුළු සිසුන්" : "Total Students",
    present: currentLang === 'si' ? "පැමිණ සිටි" : "Present",
    absent: currentLang === 'si' ? "පැමිණ නොසිටි" : "Absent",
    late: currentLang === 'si' ? "ප්‍රමාද වූ" : "Late",
    flowerOfferings: currentLang === 'si' ? "මල් පූජා" : "Flower Offerings",
    attendanceRate: currentLang === 'si' ? "පැමිණීමේ අනුපාතය" : "Attendance Rate",
    status: currentLang === 'si' ? "තත්ත්වය" : "Status",
    reason: currentLang === 'si' ? "හේතුව" : "Reason",
    flowerOffering: currentLang === 'si' ? "මල් පූජාව" : "Flower Offering",
    noData: currentLang === 'si' ? "දත්ත නොමැත" : "No data available"
  };

  // Class labels
  const CLASS_LABELS = {
    ADH: { en: "Adhiṭṭhāna", si: "අධිඨාන" },
    MET: { en: "Mettā", si: "මෙත්තා" },
    KHA: { en: "Khanti", si: "ඛන්ති" },
    NEK: { en: "Nekkhamma", si: "නෙක්කම්ම" }
  };

  // Fetch students based on filters
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.classYear) queryParams.append('classYear', filters.classYear);
        if (filters.classCode) queryParams.append('classCode', filters.classCode);
        
        const response = await axios.get(`/api/students?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setStudents(response.data.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(currentLang === 'si' ? "සිසුන් ලබා ගැනීමේ දෝෂයකි" : "Failed to fetch students");
      }
    };
    
    fetchStudents();
  }, [filters.classYear, filters.classCode, currentLang]);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', filters.startDate);
        queryParams.append('endDate', filters.endDate);
        
        if (filters.classYear) queryParams.append('classYear', filters.classYear);
        if (filters.classCode) queryParams.append('classCode', filters.classCode);
        if (filters.studentId) queryParams.append('studentId', filters.studentId);
        
        let endpoint = '/api/attendance/report';
        if (filters.reportType === 'student' && filters.studentId) {
          endpoint = `/api/attendance/student/${filters.studentId}`;
        }
        
        console.log(`Fetching report data from: ${endpoint}?${queryParams.toString()}`);
        
        const response = await axios.get(`${endpoint}?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Report data response:', response.data);
        setReportData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(currentLang === 'si' ? "වාර්තා දත්ත ලබා ගැනීමට අසමත් විය" : "Failed to fetch report data");
        
        // Generate mock data for development
        if (process.env.NODE_ENV !== 'production') {
          console.log('Generating mock data for development');
          const mockData = generateMockData();
          setReportData(mockData);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [filters, currentLang]);

  // Generate mock data for development
  const generateMockData = () => {
    if (filters.reportType === 'student') {
      // Generate student-specific mock data
      return Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          status: ['present', 'absent', 'late'][Math.floor(Math.random() * 3)],
          reason: Math.random() > 0.7 ? 'Sick leave' : '',
          flowerOffering: { brought: Math.random() > 0.6 }
        };
      });
    } else {
      // Generate summary mock data
      return Array.from({ length: 5 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const total = 50;
        const present = Math.floor(Math.random() * 20) + 25;
        const late = Math.floor(Math.random() * 5);
        const absent = total - present - late;
        
        return {
          date: date.toISOString().split('T')[0],
          total,
          present,
          absent,
          late,
          flowerOfferings: Math.floor(Math.random() * 15),
          attendanceRate: ((present + late) / total * 100).toFixed(1)
        };
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    setFilters(prev => ({
      ...prev,
      studentId: selectedId,
      reportType: selectedId ? 'student' : 'summary'
    }));
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      !filters.searchTerm ||
      student.name.en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      student.name.si?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(filters.searchTerm.toLowerCase())
    );
  }, [students, filters.searchTerm]);

  // Generate and download CSV
  const handleExportCSV = () => {
    if (!reportData.length) return;
    
    let csvContent, filename;
    
    if (filters.reportType === 'student') {
      // Student-specific attendance report
      const studentInfo = students.find(s => s._id === filters.studentId);
      const headers = [L.date, L.status, L.reason, L.flowerOffering];
      const rows = reportData.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.status.charAt(0).toUpperCase() + record.status.slice(1),
        record.reason || '',
        record.flowerOffering?.brought ? 'Yes' : 'No'
      ]);
      
      csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      filename = `${studentInfo?.studentId || 'student'}_attendance_${filters.startDate}_${filters.endDate}.csv`;
    } else {
      // Summary or class attendance report
      const headers = [L.date, L.totalStudents, L.present, L.absent, L.late, L.attendanceRate, L.flowerOfferings];
      const rows = reportData.map(day => [
        new Date(day.date).toLocaleDateString(),
        day.total,
        day.present,
        day.absent,
        day.late,
        `${day.attendanceRate}%`,
        day.flowerOfferings || 0
      ]);
      
      csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      filename = `attendance_report_${filters.startDate}_${filters.endDate}.csv`;
    }
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate and download PDF
  const handleExportPDF = () => {
    if (!reportData.length) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(L.report, doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    // Add report parameters
    doc.setFontSize(10);
    doc.text(`${L.startDate}: ${new Date(filters.startDate).toLocaleDateString()} - ${L.endDate}: ${new Date(filters.endDate).toLocaleDateString()}`, 14, 25);
    
    if (filters.classYear) {
      doc.text(`${L.classYear}: ${filters.classYear}`, 14, 30);
    }
    
    if (filters.classCode) {
      const className = CLASS_LABELS[filters.classCode]?.[currentLang] || filters.classCode;
      doc.text(`${L.class}: ${className}`, 14, 35);
    }
    
    if (filters.studentId && filters.reportType === 'student') {
      const student = students.find(s => s._id === filters.studentId);
      if (student) {
        doc.text(`Student: ${student.name[currentLang] || student.name.en} (${student.studentId})`, 14, 40);
      }
    }
    
    // Add report data as table
    if (filters.reportType === 'student') {
      doc.autoTable({
        startY: 50,
        head: [[L.date, L.status, L.reason, L.flowerOffering]],
        body: reportData.map(record => [
          new Date(record.date).toLocaleDateString(),
          record.status.charAt(0).toUpperCase() + record.status.slice(1),
          record.reason || '',
          record.flowerOffering?.brought ? 'Yes' : 'No'
        ])
      });
      
      // Add summary statistics
      if (reportData.summary) {
        doc.setFontSize(12);
        doc.text(L.summary, 14, doc.lastAutoTable.finalY + 15);
        
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [[L.totalDays, L.present, L.absent, L.late, L.attendanceRate, L.flowerOfferings]],
          body: [[
            reportData.summary.total,
            reportData.summary.present,
            reportData.summary.absent,
            reportData.summary.late,
            `${reportData.summary.attendanceRate}%`,
            reportData.summary.flowerOfferings || 0
          ]]
        });
      }
    } else {
      doc.autoTable({
        startY: 50,
        head: [[L.date, L.totalStudents, L.present, L.absent, L.late, L.attendanceRate, L.flowerOfferings]],
        body: reportData.map(day => [
          new Date(day.date).toLocaleDateString(),
          day.total || 0,
          day.present || 0,
          day.absent || 0,
          day.late || 0,
          `${day.attendanceRate || 0}%`,
          day.flowerOfferings || 0
        ])
      });
    }
    
    // Save PDF
    doc.save(`attendance_report_${filters.startDate}_${filters.endDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
            {L.report}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              disabled={!reportData.length}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaFileCsv className="mr-2" />
              {L.exportCSV}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!reportData.length}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <FaFilePdf className="mr-2" />
              {L.exportPDF}
            </button>
          </div>
        </div>
        
        {/* Report Type Selection */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setFilters(prev => ({ ...prev, reportType: 'summary', studentId: '' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filters.reportType === 'summary'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                }`}
              >
                {L.summaryReport}
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, reportType: 'student' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filters.reportType === 'student'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                }`}
              >
                {L.studentReport}
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, reportType: 'class', studentId: '' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filters.reportType === 'class'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                }`}
              >
                {L.classReport}
              </button>
            </nav>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.startDate}
            </label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.endDate}
            </label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.classYear}
            </label>
            <div className="relative">
              <input
                type="text"
                name="classYear"
                value={filters.classYear}
                onChange={handleFilterChange}
                placeholder="2023"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {L.class}
            </label>
            <select
              name="classCode"
              value={filters.classCode}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">{L.allClasses}</option>
              <option value="ADH">{CLASS_LABELS.ADH[currentLang]}</option>
              <option value="MET">{CLASS_LABELS.MET[currentLang]}</option>
              <option value="KHA">{CLASS_LABELS.KHA[currentLang]}</option>
              <option value="NEK">{CLASS_LABELS.NEK[currentLang]}</option>
            </select>
          </div>
        </div>
        
        {/* Student Selection (only for student report) */}
        {filters.reportType === 'student' && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {L.search}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={handleSearch}
                    placeholder={L.searchPlaceholder}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserAlt className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {L.selectStudent}
                </label>
                <select
                  value={filters.studentId}
                  onChange={handleStudentSelect}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">{L.select}</option>
                  {filteredStudents.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name[currentLang] || student.name.en} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Report Data Table */}
        <div>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              {error}
            </div>
          ) : (
            <div>
              {filters.reportType === 'summary' && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {L.summary}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {L.totalDays}
                      </h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.length}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {L.avgPresent}
                      </h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.length > 0 
                          ? `${(reportData.reduce((sum, day) => sum + day.present, 0) / reportData.length).toFixed(1)} (${((reportData.reduce((sum, day) => sum + day.present, 0) / (reportData.reduce((sum, day) => sum + day.total, 0) || 1)) * 100).toFixed(1)}%)`
                          : '0 (0%)'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {L.avgAbsent}
                      </h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.length > 0
                          ? `${(reportData.reduce((sum, day) => sum + day.absent, 0) / reportData.length).toFixed(1)} (${((reportData.reduce((sum, day) => sum + day.absent, 0) / (reportData.reduce((sum, day) => sum + day.total, 0) || 1)) * 100).toFixed(1)}%)`
                          : '0 (0%)'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {L.avgLate}
                      </h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.length > 0
                          ? `${(reportData.reduce((sum, day) => sum + day.late, 0) / reportData.length).toFixed(1)} (${((reportData.reduce((sum, day) => sum + day.late, 0) / (reportData.reduce((sum, day) => sum + day.total, 0) || 1)) * 100).toFixed(1)}%)`
                          : '0 (0%)'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {L.avgFlowers}
                      </h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.length > 0
                          ? `${(reportData.reduce((sum, day) => sum + (day.flowerOfferings || 0), 0) / reportData.length).toFixed(1)} (${((reportData.reduce((sum, day) => sum + (day.flowerOfferings || 0), 0) / (reportData.reduce((sum, day) => sum + day.total, 0) || 1)) * 100).toFixed(1)}%)`
                          : '0 (0%)'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {filters.reportType === 'summary' && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.date}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.totalStudents}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.present}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.absent}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.late}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.flowerOfferings}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.attendanceRate}
                          </th>
                        </>
                      )}
                      
                      {filters.reportType === 'student' && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.date}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.status}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.reason}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {L.flowerOffering}
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={filters.reportType === 'summary' ? 7 : 4} className="px-6 py-4 text-center text-gray-500">
                          {L.noData}
                        </td>
                      </tr>
                    ) : (
                      reportData.map((day, idx) => (
                        <tr key={`${day.date}-${idx}`}>
                          {filters.reportType === 'summary' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {new Date(day.date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.total}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.present}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.absent}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.late}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.flowerOfferings || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.attendanceRate}%
                                </div>
                              </td>
                            </>
                          )}
                          
                          {filters.reportType === 'student' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {new Date(day.date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.reason || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {day.flowerOffering?.brought ? 'Yes' : 'No'}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;