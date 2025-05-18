import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaCalendarAlt, FaCheck, FaTimes, FaClock, FaSearch, FaFlower } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const MarkAttendance = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [events, setEvents] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    classYear: new Date().getFullYear().toString(),
    classCode: ''
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
        
        const queryParams = new URLSearchParams();
        if (filter.classYear) queryParams.append('classYear', filter.classYear);
        if (filter.classCode) queryParams.append('classCode', filter.classCode);
        
        const response = await axios.get(`/api/students?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const studentsData = response.data.data || [];
        setStudents(studentsData);
        
        // Initialize attendance records for all students
        setAttendance(prev => ({
          ...prev,
          records: studentsData.map(student => ({
            studentId: student._id,
            studentName: student.name.en,
            status: 'present',
            reason: '',
            flowerOffering: {
              brought: false,
              flowerType: '',
              notes: ''
            }
          }))
        }));
        
        // Check if attendance for this date already exists
        fetchAttendanceForDate(selectedDate);
        
      } catch (error) {
        console.error("Error fetching students:", error);
        setError(error.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [filter, selectedDate]);

  // Fetch events for calendar
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        
        const response = await axios.get(`/api/attendance/events?year=${year}&month=${month}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setEvents(response.data.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    
    fetchEvents();
  }, [selectedDate]);

  // Fetch attendance data for selected date
  const fetchAttendanceForDate = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      
      const response = await axios.get(`/api/attendance/report?startDate=${formattedDate}&endDate=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.data && response.data.data.length > 0) {
        const dayData = response.data.data[0];
        
        // Update attendance records with existing data
        setAttendance(prev => {
          const updatedRecords = prev.records.map(record => {
            const existingData = dayData.students[record.studentId];
            
            if (existingData) {
              return {
                ...record,
                status: existingData.status,
                reason: existingData.reason || '',
                flowerOffering: existingData.flowerOffering || { brought: false }
              };
            }
            
            return record;
          });
          
          return {
            date: formattedDate,
            records: updatedRecords
          };
        });
      }
    } catch (error) {
      console.error("Error fetching attendance for date:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // Update attendance date
    setAttendance(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.studentId === studentId 
          ? { ...record, status } 
          : record
      )
    }));
  };

  const handleReasonChange = (studentId, reason) => {
    setAttendance(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.studentId === studentId 
          ? { ...record, reason } 
          : record
      )
    }));
  };

  const handleFlowerOfferingChange = (studentId, field, value) => {
    setAttendance(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.studentId === studentId 
          ? { 
              ...record, 
              flowerOffering: { 
                ...record.flowerOffering, 
                [field]: value 
              } 
            } 
          : record
      )
    }));
  };
  
  // Bulk status actions
  const handleBulkStatus = (status) => {
    setAttendance(prev => ({
      ...prev,
      records: prev.records.map(record => ({
        ...record,
        status
      }))
    }));
  };
  
  // Filter students by search term
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.si?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if selected date is a Sunday (main class day)
      const dayOfWeek = selectedDate.getDay();
      const isPoyaday = events.some(event => 
        event.type === 'poya' && 
        new Date(event.date).toDateString() === selectedDate.toDateString()
      );
      
      // Only proceed if it's a Sunday or Poya day
      if (dayOfWeek !== 0 && !isPoyaday) {
        const confirmNonClassDay = window.confirm(
          t('attendance.confirmNonClassDay')
        );
        
        if (!confirmNonClassDay) {
          setSaving(false);
          return;
        }
      }
      
      const response = await axios.post('/api/attendance', attendance, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess(t('attendance.markingSuccess'));
      
      // Reset flower offerings after successful submission
      setAttendance(prev => ({
        ...prev,
        records: prev.records.map(record => ({
          ...record,
          flowerOffering: {
            brought: false,
            flowerType: '',
            notes: ''
          }
        }))
      }));
      
    } catch (error) {
      console.error("Error marking attendance:", error);
      setError(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  // Calendar tile content - show events on calendar
  const tileContent = ({ date, view }) => {
    // Only add content on month view
    if (view !== 'month') return null;
    
    const dateString = date.toDateString();
    
    // Check if this date has an event
    const eventForDate = events.find(event => 
      new Date(event.date).toDateString() === dateString
    );
    
    if (eventForDate) {
      let color;
      switch(eventForDate.type) {
        case 'holiday': color = 'bg-red-500'; break;
        case 'poya': color = 'bg-yellow-500'; break;
        case 'flowerOffering': color = 'bg-green-500'; break;
        case 'special': color = 'bg-purple-500'; break;
        default: color = 'bg-blue-500'; 
      }
      
      return (
        <div className="flex flex-col items-center">
          <div className={`w-2 h-2 rounded-full ${color} mt-1`}></div>
          {/* Add a tiny label for the event */}
          <div className="text-xs truncate w-full text-center" style={{ fontSize: '8px' }}>
            {eventForDate.title?.en}
          </div>
        </div>
      );
    }
    
    // Highlight Sundays
    if (date.getDay() === 0) {
      return <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 mx-auto"></div>;
    }
    
    return null;
  };

  // Calendar tile class - add custom classes to dates
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dateString = date.toDateString();
    let classes = [];
    
    // Check if this date has an event
    const eventForDate = events.find(event => 
      new Date(event.date).toDateString() === dateString
    );
    
    if (eventForDate) {
      switch(eventForDate.type) {
        case 'holiday': classes.push('holiday-tile'); break;
        case 'poya': classes.push('poya-tile'); break;
        case 'flowerOffering': classes.push('flower-tile'); break;
        case 'special': classes.push('special-event-tile'); break;
      }
    }
    
    // Highlight Sundays
    if (date.getDay() === 0) {
      classes.push('sunday-tile');
    }
    
    return classes.join(' ');
  };
  
  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('attendance.markAttendance')}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar & Class Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="calendar-container p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Calendar 
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="w-full dark:bg-gray-800 dark:text-white"
              />
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {t('attendance.sunday')}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {t('attendance.poya')}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {t('attendance.holiday')}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {t('attendance.flowerOffering')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Class Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('attendance.classYear')}
                </label>
                <input
                  type="text"
                  name="classYear"
                  value={filter.classYear}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('attendance.class')}
                </label>
                <select
                  name="classCode"
                  value={filter.classCode}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">{t('attendance.allClasses')}</option>
                  <option value="ADH">{t('classes.ADH.name')}</option>
                  <option value="MET">{t('classes.MET.name')}</option>
                  <option value="KHA">{t('classes.KHA.name')}</option>
                  <option value="NEK">{t('classes.NEK.name')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('attendance.search')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('attendance.searchPlaceholder')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Selected Date Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaCalendarAlt className="text-blue-500 dark:text-blue-300 mr-2" />
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">
                    {t('attendance.selectedDate')}
                  </h3>
                </div>
                <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">
                  {selectedDate.toLocaleDateString(undefined, { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                {/* Special events for this date */}
                {events.filter(event => 
                  new Date(event.date).toDateString() === selectedDate.toDateString()
                ).map(event => (
                  <div key={event._id} className="mt-2 text-sm">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      event.type === 'holiday' ? 'bg-red-500' :
                      event.type === 'poya' ? 'bg-yellow-500' :
                      event.type === 'flowerOffering' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {event.title[i18n.language]} - {t(`attendance.eventTypes.${event.type}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Attendance Form */}
          <div className="lg:col-span-2">
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
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleBulkStatus('present')}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                <FaCheck className="mr-1" /> {t('attendance.markAllPresent')}
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('absent')}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                <FaTimes className="mr-1" /> {t('attendance.markAllAbsent')}
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('late')}
                className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
              >
                <FaClock className="mr-1" /> {t('attendance.markAllLate')}
              </button>
            </div>
            
            {/* Form */}
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  {students.length > 0 
                    ? t('attendance.noStudentsMatchSearch')
                    : t('attendance.noStudentsFound')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('attendance.studentId')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('attendance.name')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('attendance.status')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('attendance.reason')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('attendance.flowerOffering')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredStudents.map((student) => {
                        const record = attendance.records.find(r => r.studentId === student._id);
                        return (
                          <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {student.studentId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {student.name.en}
                              <div className="text-xs text-gray-400">
                                {student.name.si}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
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
                                <option value="present">{t('attendance.present')}</option>
                                <option value="absent">{t('attendance.absent')}</option>
                                <option value="late">{t('attendance.late')}</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {(record?.status === 'absent' || record?.status === 'late') && (
                                <input
                                  type="text"
                                  value={record?.reason || ''}
                                  onChange={(e) => handleReasonChange(student._id, e.target.value)}
                                  placeholder={t('attendance.reasonPlaceholder')}
                                  className="w-full px-3 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={record?.flowerOffering?.brought || false}
                                  onChange={(e) => handleFlowerOfferingChange(student._id, 'brought', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  {t('attendance.broughtFlowers')}
                                </label>
                              </div>
                              
                              {record?.flowerOffering?.brought && (
                                <div className="mt-2 space-y-2">
                                  <input
                                    type="text"
                                    value={record?.flowerOffering?.flowerType || ''}
                                    onChange={(e) => handleFlowerOfferingChange(student._id, 'flowerType', e.target.value)}
                                    placeholder={t('attendance.flowerType')}
                                    className="w-full px-3 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                  />
                                  <textarea
                                    value={record?.flowerOffering?.notes || ''}
                                    onChange={(e) => handleFlowerOfferingChange(student._id, 'notes', e.target.value)}
                                    placeholder={t('attendance.flowerNotes')}
                                    className="w-full px-3 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
                                    rows="2"
                                  ></textarea>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('attendance.studentsShown')}: {filteredStudents.length} / {students.length}
                  </span>
                  <button
                    type="submit"
                    disabled={saving}
                    className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
                  >
                    {saving ? t('common.submitting') : t('attendance.submitAttendance')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;