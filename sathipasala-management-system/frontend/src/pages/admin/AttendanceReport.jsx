import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaFileCsv, 
  FaFilePdf, 
  FaCalendarAlt, 
  FaUserAlt, 
  FaFilter,
  FaSeedling // Replace FaFlower with FaSeedling or another appropriate icon
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AttendanceReport = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);ue);
  const [reportData, setReportData] = useState([]);
  const [students, setStudents] = useState([]);[]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // TodaygetMonth(), 1).toISOString().split('T')[0], // First day of current month
    classYear: '',ate().toISOString().split('T')[0], // Today
    classCode: '',
    studentId: '',
    searchTerm: '',
    reportType: 'summary' // summary, student, class
  });eportType: 'summary' // summary, student, class
  });
  // Fetch students based on filters
  useEffect(() => { based on filters
    const fetchStudents = async () => {
      try {etchStudents = async () => {
        const queryParams = new URLSearchParams();
        if (filters.classYear) queryParams.append('classYear', filters.classYear);
        if (filters.classCode) queryParams.append('classCode', filters.classCode);
        if (filters.classCode) queryParams.append('classCode', filters.classCode);
        const response = await axios.get(`/api/students?${queryParams.toString()}`, {
          headers: {se = await axios.get(`/api/students?${queryParams.toString()}`, {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          } Authorization: `Bearer ${localStorage.getItem('token')}`
        });
        });
        setStudents(response.data.data || []);
      } catch (error) {ponse.data.data || []);
        console.error('Error fetching students:', error);
        setError(error.response?.data?.message || 'Failed to fetch students');
      } setError(error.response?.data?.message || 'Failed to fetch students');
    };}
    };
    fetchStudents();
  }, [filters.classYear, filters.classCode]);
  }, [filters.classYear, filters.classCode]);
  // Fetch report data
  useEffect(() => {ata
    const fetchReportData = async () => {
      try {etchReportData = async () => {
        setLoading(true);
        setLoading(true);
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', filters.startDate);
        queryParams.append('endDate', filters.endDate);te);
        if (filters.classYear) queryParams.append('classYear', filters.classYear);
        if (filters.classCode) queryParams.append('classCode', filters.classCode);
        if (filters.studentId) queryParams.append('studentId', filters.studentId);
        if (filters.studentId) queryParams.append('studentId', filters.studentId);
        let endpoint = '/api/attendance/report';
        if (filters.reportType === 'student' && filters.studentId) {
          endpoint = `/api/attendance/student/${filters.studentId}`;
        } endpoint = `/api/attendance/student/${filters.studentId}`;
        }
        const response = await axios.get(`${endpoint}?${queryParams.toString()}`, {
          headers: {se = await axios.get(`${endpoint}?${queryParams.toString()}`, {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          } Authorization: `Bearer ${localStorage.getItem('token')}`
        });
        });
        setReportData(response.data.data || []);
      } catch (error) {esponse.data.data || []);
        console.error('Error fetching report data:', error);
        setError(error.response?.data?.message || 'Failed to fetch report data');
      } finally {error.response?.data?.message || 'Failed to fetch report data';
        setLoading(false);
      } setLoading(false);
    };}
    };
    fetchReportData();
  }, [filters]);ata();
  }, [filters]);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };setFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    setFilters(prev => ({target.value;
      ...prev,(prev => ({
      studentId: selectedId,
      reportType: selectedId ? 'student' : 'summary'
    }));portType: selectedId ? 'student' : 'summary'
  };}));
  };
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };
  // Filter students by search term
  const filteredStudents = useMemo(() => {
    return students.filter(student => => {
      !filters.searchTerm ||tudent =>
      student.name.en.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      student.name.si?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(filters.searchTerm.toLowerCase())||
    );student.studentId.toLowerCase().includes(filters.searchTerm.toLowerCase())
  }, [students, filters.searchTerm]);
  }, [students, filters.searchTerm]);
  // Generate and download CSV
  const handleExportCSV = () => {
    if (!reportData.length) return;
    if (!reportData.length) return;
    let csvContent, filename;
    let csvContent, filename;
    if (filters.reportType === 'student') {
      // Student-specific attendance report
      const studentInfo = students.find(s => s._id === filters.studentId);
      const studentInfo = students.find(s => s._id === filters.studentId);
      const headers = ['Date', 'Status', 'Reason', 'Flower Offering'];
      const rows = reportData.map(record => [son', 'Flower Offering'];
        new Date(record.date).toLocaleDateString(),
        record.status.charAt(0).toUpperCase() + record.status.slice(1),
        record.reason || '',(0).toUpperCase() + record.status.slice(1),
        record.flowerOffering?.brought ? 'Yes' : 'No'
      ]);ecord.flowerOffering?.brought ? 'Yes' : 'No'
      ]);
      csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');(row => row.join(','))
      ].join('\n');
      filename = `${studentInfo?.studentId || 'student'}_attendance_${filters.startDate}_${filters.endDate}.csv`;
    } else {me = `${studentInfo?.studentId || 'student'}_attendance_${filters.startDate}_${filters.endDate}.csv`;
      // Summary or class attendance report
      const headers = ['Date', 'Total Students', 'Present', 'Absent', 'Late', 'Attendance Rate', 'Flower Offerings'];
      const rows = reportData.map(day => [ents', 'Present', 'Absent', 'Late', 'Attendance Rate', 'Flower Offerings'];
        new Date(day.date).toLocaleDateString(),
        day.total,ay.date).toLocaleDateString(),
        day.present,
        day.absent,,
        day.late,t,
        `${day.attendanceRate}%`,
        day.flowerOfferings || 0,
      ]);ay.flowerOfferings || 0
      ]);
      csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');(row => row.join(','))
      ].join('\n');
      filename = `attendance_report_${filters.startDate}_${filters.endDate}.csv`;
    } filename = `attendance_report_${filters.startDate}_${filters.endDate}.csv`;
    }
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', url);ment('a');
    link.setAttribute('download', filename);
    document.body.appendChild(link);lename);
    link.click();.appendChild(link);
    document.body.removeChild(link);
  };document.body.removeChild(link);
  };
  // Generate and download PDF
  const handleExportPDF = () => {
    if (!reportData.length) return;
    if (!reportData.length) return;
    const doc = new jsPDF();
    const doc = new jsPDF();
    // Add title
    doc.setFontSize(18);
    doc.text('Attendance Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    doc.text('Attendance Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    // Add report parameters
    doc.setFontSize(10);ters
    doc.text(`Period: ${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`, 14, 25);
    doc.text(`Period: ${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`, 14, 25);
    if (filters.classYear) {
      doc.text(`Class Year: ${filters.classYear}`, 14, 30);
    } doc.text(`Class Year: ${filters.classYear}`, 14, 30);
    }
    if (filters.classCode) {
      const className = t(`classes.${filters.classCode}.name`) || filters.classCode;
      doc.text(`Class: ${className}`, 14, 35);
    } doc.text(`Class: ${t(`classes.${filters.classCode}.name`)}`, 14, 35);
    }
    if (filters.studentId && filters.reportType === 'student') {
      const student = students.find(s => s._id === filters.studentId);
      if (student) {= students.find(s => s._id === filters.studentId);
        doc.text(`Student: ${student.name.en} (${student.studentId})`, 14, 40);
      } doc.text(`Student: ${student.name.en} (${student.studentId})`, 14, 40);
    } }
    }
    // Add report data as table
    if (filters.reportType === 'student') {
      doc.autoTable({tType === 'student') {
        startY: 50,({
        head: [['Date', 'Status', 'Reason', 'Flower Offering']],
        body: reportData.map(record => [n', 'Flower Offering']],
          new Date(record.date).toLocaleDateString(),
          record.status.charAt(0).toUpperCase() + record.status.slice(1),
          record.reason || '',(0).toUpperCase() + record.status.slice(1),
          record.flowerOffering?.brought ? 'Yes' : 'No'
        ])record.flowerOffering?.brought ? 'Yes' : 'No'
      });)
      });
      // Add summary statistics
      if (reportData.summary) {
        doc.setFontSize(12);) {
        doc.text('Attendance Summary', 14, doc.lastAutoTable.finalY + 15);
        doc.text('Attendance Summary', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Total Days', 'Present', 'Absent', 'Late', 'Attendance Rate', 'Flower Offerings']],
          body: [['Total Days', 'Present', 'Absent', 'Late', 'Attendance Rate', 'Flower Offerings']],
            reportData.summary.total,
            reportData.summary.present,
            reportData.summary.absent,,
            reportData.summary.late,t,
            `${reportData.summary.attendanceRate}%`,
            reportData.summary.flowerOfferings || 0,
          ]]reportData.summary.flowerOfferings || 0
        });]
      } });
    } else {
      doc.autoTable({
        startY: 50,({
        head: [['Date', 'Total', 'Present', 'Absent', 'Late', 'Rate', 'Flowers']],
        body: reportData.map(day => [
          new Date(day.date).toLocaleDateString(),
          day.total || 0,
          day.present || 0,
          day.absent || 0,
          day.late || 0,
          `${day.attendanceRate || 0}%`,
          day.flowerOfferings || 0
        ])day.flowerOfferings || 0
      });)
    } });
    }
    // Save PDF
    doc.save(`attendance_report_${filters.startDate}_${filters.endDate}.pdf`);
  };doc.save(`attendance_report_${filters.startDate}_${filters.endDate}.pdf`);
  };
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
            {t('attendance.report')}t-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
          </h2>'attendance.report')}
          <div className="flex space-x-2">
            <buttonsName="flex space-x-2">
              onClick={handleExportCSV}
              disabled={!reportData.length}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            > className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              <FaFileCsv className="mr-2" />
              {t('attendance.exportCSV')} />
            </button>endance.exportCSV')}
            <buttonn>
              onClick={handleExportPDF}
              disabled={!reportData.length}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            > className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              <FaFilePdf className="mr-2" />
              {t('attendance.exportPDF')} />
            </button>endance.exportPDF')}
          </div>tton>
        </div>v>
        </div>
        {/* Report Type Selection */}
        <div className="mb-6">ion */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-6">dark:border-gray-700 mb-4">
              <buttonsName="-mb-px flex space-x-6">
                onClick={() => setFilters(prev => ({ ...prev, reportType: 'summary', studentId: '' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${e: 'summary', studentId: '' }))}
                  filters.reportType === 'summary'ont-medium text-sm ${
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                }`} : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
              > }`}
                {t('attendance.summaryReport')}
              </button>endance.summaryReport')}
              <buttonn>
                onClick={() => setFilters(prev => ({ ...prev, reportType: 'student' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${e: 'student' }))}
                  filters.reportType === 'student'ont-medium text-sm ${
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                }`} : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
              > }`}
                {t('attendance.studentReport')}
              </button>endance.studentReport')}
              <buttonn>
                onClick={() => setFilters(prev => ({ ...prev, reportType: 'class', studentId: '' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${e: 'class', studentId: '' }))}
                  filters.reportType === 'class' font-medium text-sm ${
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
                }`} : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300'
              > }`}
                {t('attendance.classReport')}
              </button>endance.classReport')}
            </nav>tton>
          </div>v>
        </div>v>
        </div>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>assName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('attendance.startDate')}sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            </label>tendance.startDate')}
            <div className="relative">
              <inputssName="relative">
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-4 w-4 text-gray-400" />tems-center pointer-events-none">
              </div>alendarAlt className="h-4 w-4 text-gray-400" />
            </div>v>
          </div>v>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('attendance.endDate')}t-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            </label>tendance.endDate')}
            <div className="relative">
              <inputssName="relative">
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-4 w-4 text-gray-400" />tems-center pointer-events-none">
              </div>alendarAlt className="h-4 w-4 text-gray-400" />
            </div>v>
          </div>v>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('attendance.classYear')}sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            </label>tendance.classYear')}
            <div className="relative">
              <inputssName="relative">
                type="text"
                name="classYear"
                value={filters.classYear}
                onChange={handleFilterChange}
                placeholder="2023"lterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="h-4 w-4 text-gray-400" />lex items-center pointer-events-none">
              </div>ilter className="h-4 w-4 text-gray-400" />
            </div>v>
          </div>v>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('attendance.class')}ext-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            </label>tendance.class')}
            <select>
              name="classCode"
              value={filters.classCode}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            > className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              <option value="">{t('attendance.allClasses')}</option>
              <option value="ADH">{t('classes.ADH.name')}</option>n>
              <option value="MET">{t('classes.MET.name')}</option>
              <option value="KHA">{t('classes.KHA.name')}</option>
              <option value="NEK">{t('classes.NEK.name')}</option>
            </select> value="NEK">{t('classes.NEK.name')}</option>
          </div>lect>
        </div>v>
        </div>
        {/* Student Selection (only for student report) */}
        {filters.reportType === 'student' && (t report) */}
          <div className="mb-6">'student' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">-1 md:grid-cols-3 gap-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('attendance.search')}xt-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                </label>tendance.search')}
                <div className="relative">
                  <inputssName="relative">
                    type="text"
                    value={filters.searchTerm}
                    onChange={handleSearch}rm}
                    placeholder={t('attendance.searchPlaceholder')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserAlt className="h-4 w-4 text-gray-400" />ex items-center pointer-events-none">
                  </div>serAlt className="h-4 w-4 text-gray-400" />
                </div>v>
              </div>v>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('attendance.selectStudent')}ont-medium text-gray-700 dark:text-gray-300 mb-1">
                </label>tendance.selectStudent')}
                <select>
                  value={filters.studentId}
                  onChange={handleStudentSelect}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                > className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  <option value="">{t('common.select')}</option>
                  {filteredStudents.map(student => (}</option>
                    <option key={student._id} value={student._id}>
                      {student.name.en} ({student.studentId})_id}>
                    </option>t.name.en} ({student.studentId})
                  ))}/option>
                </select>
              </div>lect>
            </div>v>
          </div>v>
        )}</div>
        {/* Report Data Table */}
        <div>eport Data Table */}
          {loading ? (
            <div className="text-center py-4">
              <span className="loader"></span>
            </div>n className="loader"></span>
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              {error}sName="text-red-500 text-center py-4">
            </div>or}
          ) : (iv>
            <div>
              {filters.reportType === 'summary' && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('attendance.summary')}-semibold text-gray-900 dark:text-white mb-4">
                  </h3>'attendance.summary')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('attendance.totalDays')}xt-gray-900 dark:text-white mb-2">
                      </h4>'attendance.totalDays')}
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.length}l font-bold text-gray-800 dark:text-gray-200">
                      </p>eportData.length}
                    </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('attendance.avgPresent')}t-gray-900 dark:text-white mb-2">
                      </h4>'attendance.avgPresent')}
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.length > 0 
                          ? `${(reportData.reduce((sum, day) => sum + day.present, 0) / reportData.length).toFixed(1)} (${((reportData.reduce((sum, day) => sum + day.present, 0) / (reportData.reduce((sum, day) => sum + day.total, 0) || 1)) * 100).toFixed(1)}%)` eportData.reduce((sum, day) => sum + day.present, 0) / reportData.length} ({((reportData.reduce((sum, day) => sum + day.present, 0) / reportData.reduce((sum, day) => sum + day.total, 0)) * 100).toFixed(1)}%)
                          : '0 (0%)'
                        }</div>
                      </p>
                    </div>
                    xt-gray-900 dark:text-white mb-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">'attendance.avgAbsent')}
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('attendance.avgAbsent')}
                      </h4>eportData.reduce((sum, day) => sum + day.absent, 0) / reportData.length} ({((reportData.reduce((sum, day) => sum + day.absent, 0) / reportData.reduce((sum, day) => sum + day.total, 0)) * 100).toFixed(1)}%)
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.reduce((sum, day) => sum + day.absent, 0) / reportData.length} ({((reportData.reduce((sum, day) => sum + day.absent, 0) / reportData.reduce((sum, day) => sum + day.total, 0)) * 100).toFixed(1)}%)</div>
                      </p>
                    </div>
                    text-gray-900 dark:text-white mb-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">'attendance.avgLate')}
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('attendance.avgLate')}
                      </h4>eportData.reduce((sum, day) => sum + day.late, 0) / reportData.length} ({((reportData.reduce((sum, day) => sum + day.late, 0) / reportData.reduce((sum, day) => sum + day.total, 0)) * 100).toFixed(1)}%)
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.reduce((sum, day) => sum + day.late, 0) / reportData.length} ({((reportData.reduce((sum, day) => sum + day.late, 0) / reportData.reduce((sum, day) => sum + day.total, 0)) * 100).toFixed(1)}%)</div>
                      </p>
                    </div>
                    t-gray-900 dark:text-white mb-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">'attendance.avgFlowers')}
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('attendance.avgFlowers')}
                      </h4>eportData.reduce((sum, day) => sum + (day.flowerOfferings || 0), 0) / reportData.length} ({((reportData.reduce((sum, day) => sum + (day.flowerOfferings || 0), 0) / reportData.reduce((sum, day) => sum + day.total, 0)) * 100).toFixed(1)}%)
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {reportData.reduce((sum, day) => sum + (day.flowerOfferings || 0), 0) / reportData.length} ({((reportData.reduce((sum, day) => sum + (day.flowerOfferings || 0), 0) / reportData.reduce((sum, day) => sum + day.total, 0)) * 100).toFixed(1)}%)v>
                      </p>v>
                    </div></div>
                  </div>)}
                </div>
              )}gray-700 mb-6">
              -200 dark:divide-gray-700">
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 mb-6"> className="bg-gray-50 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">ters.reportType === 'summary' && (
                    <tr>
                      {filters.reportType === 'summary' && (e="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <>'attendance.date')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.date')}y-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.totalStudents')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.totalStudents')}px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.present')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.present')}"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.absent')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.absent')}e="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.late')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.late')}3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.flowerOfferings')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.flowerOfferings')}-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.attendanceRate')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">/th>
                            {t('attendance.attendanceRate')}</>
                          </th>)}
                        </>
                      )}ters.reportType === 'student' && (
                      
                      {filters.reportType === 'student' && (e="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <>'attendance.date')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.date')}"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.status')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.status')}"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.reason')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('attendance.reason')}-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          </th>'attendance.flowerOffering')}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">/th>
                            {t('attendance.flowerOffering')}</>
                          </th>
                        </>
                      )}
                    </tr>ide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  </thead>tData.length === 0 ? (
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {reportData.length === 0 ? (eportType === 'summary' ? 7 : 4} className="px-6 py-4 text-center text-gray-500">
                      <tr>'common.noData')}
                        <td colSpan={filters.reportType === 'summary' ? 7 : 4} className="px-6 py-4 text-center text-gray-500">d>
                          {t('common.noData')}r>
                        </td>
                      </tr>day, idx) => (
                    ) : (
                      reportData.map((day, idx) => (ters.reportType === 'summary' && (
                        <tr key={idx}>
                          {filters.reportType === 'summary' && (
                            <>text-white">
                              <td className="px-6 py-4 whitespace-nowrap"> Date(day.date).toLocaleDateString()}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {new Date(day.date).toLocaleDateString()}
                                </div>
                              </td>e="text-sm text-gray-900 dark:text-white">
                              <td className="px-6 py-4 whitespace-nowrap">.total}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.total}
                                </div>
                              </td>"text-sm text-gray-900 dark:text-white">
                              <td className="px-6 py-4 whitespace-nowrap">.present}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.present}
                                </div>
                              </td>="text-sm text-gray-900 dark:text-white">
                              <td className="px-6 py-4 whitespace-nowrap">.absent}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.absent}
                                </div>
                              </td>me="text-sm text-gray-900 dark:text-white">
                              <td className="px-6 py-4 whitespace-nowrap">.late}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.late}
                                </div>
                              </td>-gray-900 dark:text-white">
                              <td className="px-6 py-4 whitespace-nowrap">.flowerOfferings || 0}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.flowerOfferings || 0}
                                </div>
                              </td> text-gray-900 dark:text-white">
                              <td className="px-6 py-4 whitespace-nowrap">.attendanceRate}%
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.attendanceRate}%/td>
                                </div></>
                              </td>)}
                            </>
                          )}ters.reportType === 'student' && (
                          
                          {filters.reportType === 'student' && (
                            <>text-white">
                              <td className="px-6 py-4 whitespace-nowrap"> Date(day.date).toLocaleDateString()}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {new Date(day.date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">.status.charAt(0).toUpperCase() + day.status.slice(1)}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                                </div>
                              </td>sm text-gray-900 dark:text-white">
                              <td className="px-6 py-4 whitespace-nowrap">.reason || '-'}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.reason || '-'}
                                </div>
                              </td>t-white">
                              <td className="px-6 py-4 whitespace-nowrap">.flowerOffering?.brought ? 'Yes' : 'No'}
                                <div className="text-sm text-gray-900 dark:text-white">iv>
                                  {day.flowerOffering?.brought ? 'Yes' : 'No'}/td>
                                </div></>
                              </td>
                            </></tr>
                          )} ))
                        </tr>
                      ))y>
                    }ble>
                  </tbody>v>
                </table></div>
              </div>
            </div>v>
          )}v>
        </div></div>
      </div>);
    </div>};
  );



export default AttendanceReport;};