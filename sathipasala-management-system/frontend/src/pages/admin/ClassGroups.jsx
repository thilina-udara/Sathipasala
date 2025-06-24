import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserGraduate, 
  FaCalendarCheck, 
  FaSync, 
  FaExclamationTriangle, 
  FaUsers,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaListUl,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaTrash,
  FaSave,
  FaPlus,
  FaMoon,
  FaSun,
  FaSpinner,
  FaMapMarkerAlt,
  FaBook,
  FaPray,
  FaOm
} from 'react-icons/fa';

// Import ShadCN components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ClassGroups = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state for student display
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Next Class and Poya Day state - FIXED: Better state management
  const [nextClass, setNextClass] = useState({
    date: '',
    time: '08:00',
    location: 'Main Hall',
    topic: 'Weekly Dharma Session'
  });
  const [nextPoyaDay, setNextPoyaDay] = useState({
    date: '',
    name: '',
    description: 'Full Moon Day - Sacred meditation and prayer session'
  });
  const [editingClass, setEditingClass] = useState(false);
  const [editingPoya, setEditingPoya] = useState(false);
  const [savingClass, setSavingClass] = useState(false);
  const [savingPoya, setSavingPoya] = useState(false);
  
  // Countdown state for smooth animations
  const [countdown, setCountdown] = useState({
    class: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    poya: { days: 0, hours: 0, minutes: 0, seconds: 0 }
  });
  
  const [classData, setClassData] = useState({
    ADH: { totalStudents: 0 },
    MET: { totalStudents: 0 },
    KHA: { totalStudents: 0 },
    NEK: { totalStudents: 0 }
  });

  // Class configurations with exact design maintained
  const classConfigs = {
    ADH: {
      name: 'Adhiṭṭhāna',
      nameSi: 'අධිඨාන',
      description: '3-6 years',
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-2 border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-gray-100',
      headingBg: 'bg-gray-100 dark:bg-gray-700',
      statBg: 'bg-gray-50 dark:bg-gray-700',
      icon: 'text-gray-400 dark:text-gray-500',
      dotColor: 'text-gray-500',
      primaryColor: '#374151'
    },
    MET: {
      name: 'Mettā',
      nameSi: 'මෙත්තා',
      description: '7-10 years',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      border: 'border-2 border-orange-200 dark:border-orange-800',
      text: 'text-orange-900 dark:text-orange-100',
      headingBg: 'bg-orange-100 dark:bg-orange-800/40',
      statBg: 'bg-orange-50 dark:bg-orange-900/40',
      icon: 'text-orange-400 dark:text-orange-500',
      dotColor: 'text-orange-500',
      primaryColor: '#800000'
    },
    KHA: {
      name: 'Khanti',
      nameSi: 'ඛන්ති',
      description: '11-13 years',
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-2 border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      headingBg: 'bg-yellow-100 dark:bg-yellow-800/40',
      statBg: 'bg-yellow-50 dark:bg-yellow-900/40',
      icon: 'text-yellow-400 dark:text-yellow-500',
      dotColor: 'text-yellow-500',
      primaryColor: '#CA8A04'
    },
    NEK: {
      name: 'Nekkhamma',
      nameSi: 'නෙක්කම්ම',
      description: '14+ years',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-2 border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      headingBg: 'bg-blue-100 dark:bg-blue-800/40',
      statBg: 'bg-blue-50 dark:bg-blue-900/40',
      icon: 'text-blue-400 dark:text-blue-500',
      dotColor: 'text-blue-500',
      primaryColor: '#1D4ED8'
    }
  };

  // Helper function for authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Helper function to safely display potentially multilingual text
  const safeDisplayName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj.en || nameObj.si || '';
  };

  // Enhanced countdown calculation with proper time handling - FIXED
  const calculateDetailedCountdown = (targetDate, targetTime = '08:00') => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    
    const now = new Date();
    
    // Create target datetime by combining date and time
    const target = new Date(targetDate);
    
    // Parse time and set on target date
    if (targetTime) {
      const [hours, minutes] = targetTime.split(':').map(Number);
      target.setHours(hours, minutes, 0, 0);
    } else {
      target.setHours(8, 0, 0, 0); // Default to 8 AM
    }
    
    const diffTime = target.getTime() - now.getTime();
    
    if (diffTime <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, expired: false };
  };

  // Format countdown text
  const formatCountdownText = (countdown) => {
    if (!countdown || countdown.expired) return null;
    
    const { days, hours, minutes } = countdown;
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Get next Sunday
  const getNextSunday = () => {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    if (nextSunday.getDay() !== 0) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }
    return nextSunday;
  };

  // Calculate next Poya day (enhanced with proper 2025 dates)
  const calculateNextPoyaDay = () => {
    const poyaDays2025 = [
      { date: '2025-01-13', name: 'Duruthu Poya' },
      { date: '2025-02-12', name: 'Navam Poya' },
      { date: '2025-03-14', name: 'Madin Poya' },
      { date: '2025-04-13', name: 'Bak Poya' },
      { date: '2025-05-12', name: 'Vesak Poya' },
      { date: '2025-06-11', name: 'Poson Poya' },
      { date: '2025-07-10', name: 'Esala Poya' },
      { date: '2025-08-09', name: 'Nikini Poya' },
      { date: '2025-09-07', name: 'Binara Poya' },
      { date: '2025-10-06', name: 'Vap Poya' },
      { date: '2025-11-05', name: 'Il Poya' },
      { date: '2025-12-04', name: 'Unduvap Poya' }
    ];

    const now = new Date();
    const nextPoya = poyaDays2025.find(poya => new Date(poya.date) > now);
    return nextPoya || poyaDays2025[0];
  };

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const classCountdown = calculateDetailedCountdown(nextClass.date, nextClass.time);
      const poyaCountdown = calculateDetailedCountdown(nextPoyaDay.date, '00:00'); // Poya starts at midnight
      
      setCountdown({
        class: classCountdown,
        poya: poyaCountdown
      });
    };

    updateCountdown(); // Initial calculation
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextClass.date, nextClass.time, nextPoyaDay.date]);

  // -------- REMOVING ICONS AND FIXING ATTENDANCE COUNT --------

  // First, fix the fetch logic for class data to properly calculate attendance counts
  // Update the fetchClassData function to only fetch total students
  const fetchClassData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Initialize class data - SIMPLIFIED: Only totalStudents needed
      const updatedClassData = {
        ADH: { totalStudents: 0 },
        MET: { totalStudents: 0 },
        KHA: { totalStudents: 0 },
        NEK: { totalStudents: 0 }
      };

      // Fetch total student counts by class only
      try {
        const studentsResponse = await axios.get('/api/students', {
          headers: getAuthHeaders(),
          params: { limit: 1000 }
        });

        if (studentsResponse.data.success) {
          const students = studentsResponse.data.data || [];
          
          // Count students by class
          students.forEach(student => {
            if (student.classCode && updatedClassData[student.classCode]) {
              updatedClassData[student.classCode].totalStudents++;
            }
          });
        }
      } catch (studentError) {
        console.error('Error fetching students:', studentError);
        throw new Error('Could not fetch student data from database');
      }

      setClassData(updatedClassData);
      
    } catch (error) {
      console.error('Error fetching class data:', error);
      setError(error.message || 'Failed to fetch class data from database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Helper function to get the most recent Sunday
  const getLastSunday = () => {
    const today = new Date();
    const day = today.getDay();
    
    // If today is Sunday, return today
    if (day === 0) return today;
    
    // Otherwise, go back to the most recent Sunday
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - day);
    
    return lastSunday;
  };

  // Updated fetchNextClassData function to handle missing endpoints
  const fetchNextClassData = useCallback(async () => {
    try {
      // Check localStorage first for persistence
      const savedNextClass = localStorage.getItem('nextClass');
      const savedNextPoya = localStorage.getItem('nextPoyaDay');

      if (savedNextClass) {
        const parsedClass = JSON.parse(savedNextClass);
        setNextClass(parsedClass);
      } else {
        // Set default next class (next Sunday)
        const nextSunday = getNextSunday();
        const defaultClass = {
          date: nextSunday.toISOString().split('T')[0],
          time: '08:00',
          location: 'Main Hall',
          topic: 'Weekly Dharma Session'
        };
        setNextClass(defaultClass);
        localStorage.setItem('nextClass', JSON.stringify(defaultClass));
      }

      if (savedNextPoya) {
        const parsedPoya = JSON.parse(savedNextPoya);
        setNextPoyaDay(parsedPoya);
      } else {
        // Set default next poya
        const nextPoya = calculateNextPoyaDay();
        const defaultPoya = {
          date: nextPoya.date,
          name: nextPoya.name,
          description: 'Full Moon Day - Sacred meditation and prayer session'
        };
        setNextPoyaDay(defaultPoya);
        localStorage.setItem('nextPoyaDay', JSON.stringify(defaultPoya));
      }

      // REMOVED API calls to non-existent endpoints
      // Instead, we rely solely on localStorage or default values
      
    } catch (error) {
      console.error('Error setting up next class data:', error);
      // Fallback to defaults
      const nextSunday = getNextSunday();
      const nextPoya = calculateNextPoyaDay();
      
      setNextClass({
        date: nextSunday.toISOString().split('T')[0],
        time: '08:00',
        location: 'Main Hall',
        topic: 'Weekly Dharma Session'
      });
      
      setNextPoyaDay({
        date: nextPoya.date,
        name: nextPoya.name,
        description: 'Full Moon Day - Sacred meditation and prayer session'
      });
    }
  }, []);

  // Save next class data - FIXED with immediate UI update
  const saveNextClass = async () => {
    setSavingClass(true);
    try {
      // Update localStorage immediately for instant UI feedback
      localStorage.setItem('nextClass', JSON.stringify(nextClass));
      
      // Try to save to API
      try {
        await axios.post('/api/schedule/next-class', nextClass, {
          headers: getAuthHeaders()
        });
        console.log('Next class saved to API successfully');
      } catch (apiError) {
        console.log('API save failed, but localStorage updated:', apiError.message);
      }
      
      setEditingClass(false);
      
      // Show success message (optional)
      console.log('Next class updated successfully');
    } catch (error) {
      console.error('Error saving next class:', error);
      setEditingClass(false);
    } finally {
      setSavingClass(false);
    }
  };

  // Save next poya data - FIXED with immediate UI update
  const saveNextPoya = async () => {
    setSavingPoya(true);
    try {
      // Update localStorage immediately for instant UI feedback
      localStorage.setItem('nextPoyaDay', JSON.stringify(nextPoyaDay));
      
      // Try to save to API
      try {
        await axios.post('/api/schedule/next-poya', nextPoyaDay, {
          headers: getAuthHeaders()
        });
        console.log('Next poya saved to API successfully');
      } catch (apiError) {
        console.log('API save failed, but localStorage updated:', apiError.message);
      }
      
      setEditingPoya(false);
      
      // Show success message (optional)
      console.log('Next poya updated successfully');
    } catch (error) {
      console.error('Error saving next poya:', error);
      setEditingPoya(false);
    } finally {
      setSavingPoya(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchClassData();
    fetchNextClassData();
  }, [fetchClassData, fetchNextClassData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    fetchClassData();
    fetchNextClassData();
  }, [refreshing, fetchClassData, fetchNextClassData]);

  // Handle view students - Modal style like reference code
  const handleViewStudents = async (classCode) => {
    try {
      setLoadingStudents(true);
      setSelectedClass(classCode);
      setShowStudentsModal(true);
      
      // Fetch students for the selected class
      const response = await axios.get(`/api/students?classCode=${classCode}&limit=100`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setClassStudents(response.data.data || []);
      } else {
        console.error('Failed to fetch students for class:', classCode);
        setClassStudents([]);
      }
    } catch (err) {
      console.error('Error fetching class students:', err);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Close students modal
  const closeStudentsModal = () => {
    setShowStudentsModal(false);
    setSelectedClass(null);
    setClassStudents([]);
  };

  // Handle attendance navigation - FIXED routing
  const handleAttendance = (classCode) => {
    navigate(`/admin/attendance?classCode=${classCode}`);
  };

  // Animated countdown component - FIXED: Unique keys to prevent conflicts between multiple countdown instances
  const CountdownDisplay = ({ countdown, expired, label }) => {
    if (expired) {
      return (
        <div className="text-center">
          <span className="text-sm font-medium opacity-75">{label} has passed</span>
        </div>
      );
    }

    // Generate unique keys that prevent conflicts between different countdown instances
    // Even if "Next Class" and "Next Poya Day" both show "3 days", the keys will be different:
    // "Class-days-3" vs "Poya Day-days-3"
    const uniqueKey = (unit, value) => `${label}-${unit}-${value}`;

    return (
      <div className="grid grid-cols-4 gap-2 text-center">
        <motion.div 
          key={uniqueKey('days', countdown.days)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="bg-white bg-opacity-20 rounded-lg p-2"
        >
          <div className="text-lg font-bold">{countdown.days}</div>
          <div className="text-xs opacity-75">Day{countdown.days !== 1 ? 's' : ''}</div>
        </motion.div>
        <motion.div 
          key={uniqueKey('hours', countdown.hours)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="bg-white bg-opacity-20 rounded-lg p-2"
        >
          <div className="text-lg font-bold">{countdown.hours}</div>
          <div className="text-xs opacity-75">Hour{countdown.hours !== 1 ? 's' : ''}</div>
        </motion.div>
        <motion.div 
          key={uniqueKey('minutes', countdown.minutes)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="bg-white bg-opacity-20 rounded-lg p-2"
        >
          <div className="text-lg font-bold">{countdown.minutes}</div>
          <div className="text-xs opacity-75">Min{countdown.minutes !== 1 ? 's' : ''}</div>
        </motion.div>
        <motion.div 
          key={uniqueKey('seconds', countdown.seconds)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="bg-white bg-opacity-20 rounded-lg p-2"
        >
          <div className="text-lg font-bold">{countdown.seconds}</div>
          <div className="text-xs opacity-75">Sec{countdown.seconds !== 1 ? 's' : ''}</div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Class Groups
          </h1>
          <div className="space-x-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200 flex items-center"
              disabled={refreshing}
            >
              <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> 
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4"
          >
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Class Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(classConfigs).map((classCode) => {
              const config = classConfigs[classCode];
              const data = classData[classCode] || { totalStudents: 0, lastAttendance: 0 };
              
              return (
                <motion.div
                  key={classCode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Object.keys(classConfigs).indexOf(classCode) * 0.1 }}
                >
                  <div 
                    className={`rounded-lg shadow-md overflow-hidden ${config.bg} ${config.border} h-full flex flex-col`}
                  >
                    {/* Card Header */}
                    <div className={`px-4 py-5 ${config.headingBg} border-b border-opacity-60`}>
                      <div className={`text-xl font-semibold ${config.text}`}>
                        {config.name} 
                        <span className="block text-sm mt-1 font-normal">
                          {config.nameSi}
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                        {config.description}
                      </div>
                    </div>
                    
                    {/* Card Body - FIXED: Added flex-1 and proper padding */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Student Count Display - Enhanced Format */}
                      <div className={`p-3 rounded-md ${config.statBg} mb-4 flex-shrink-0`}>
                        <div className="flex items-center justify-between">
                          <div className={`${config.icon}`}>
                            <FaUserGraduate size={24} />
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                            <p className={`text-lg font-bold ${config.text}`}>
                              Total: {data.totalStudents}
                            </p>
                           
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions - FIXED: Better button layout with proper spacing */}
                      <div className="mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleViewStudents(classCode)}
                            className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded flex items-center justify-center transition-colors text-sm font-medium"
                          >
                            <FaEye className="mr-1" size={14} />
                            Students
                          </button>
                          <button 
                            onClick={() => handleAttendance(classCode)}
                            className="w-full px-3 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded flex items-center justify-center transition-colors text-sm font-medium"
                          >
                            <FaCalendarCheck className="mr-1" size={14} />
                            Attendance
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Enhanced Next Class and Poya Day Cards with Mindfulness Theme */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Class Card - REMOVED ICON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Mindful gradient - Light blue to soft white */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-300 to-white"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {/* REMOVED ICON */}
                  <h3 className="text-xl font-bold text-gray-800">Next Class</h3>
                </div>
                <div className="flex space-x-2">
                  {!editingClass && (
                    <button
                      onClick={() => setEditingClass(true)}
                      className="p-2 bg-white bg-opacity-30 rounded-full hover:bg-opacity-40 transition-colors backdrop-blur-sm"
                    >
                      <FaEdit className="h-4 w-4 text-gray-700" />
                    </button>
                  )}
                  {editingClass && (
                    <>
                      <button
                        onClick={saveNextClass}
                        disabled={savingClass}
                        className="p-2 bg-green-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors backdrop-blur-sm"
                      >
                        {savingClass ? <FaSpinner className="h-4 w-4 animate-spin text-white" /> : <FaSave className="h-4 w-4 text-white" />}
                      </button>
                      <button
                        onClick={() => setEditingClass(false)}
                        className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors backdrop-blur-sm"
                      >
                        <FaTimes className="h-4 w-4 text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingClass ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                    <input
                      type="date"
                      value={nextClass.date}
                      onChange={(e) => setNextClass(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Time</label>
                    <input
                      type="time"
                      value={nextClass.time}
                      onChange={(e) => setNextClass(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
                    <input
                      type="text"
                      value={nextClass.location}
                      onChange={(e) => setNextClass(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Topic</label>
                    <input
                      type="text"
                      value={nextClass.topic}
                      onChange={(e) => setNextClass(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="Topic"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">
                      {nextClass.date ? new Date(nextClass.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric'
                      }) : 'Not scheduled'}
                    </p>
                    <p className="text-gray-600 text-lg font-medium">{nextClass.time}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700 font-medium">{nextClass.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBook className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700 font-medium">{nextClass.topic}</span>
                    </div>
                  </div>

                  {nextClass.date && (
                    <div className="bg-white bg-opacity-40 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaClock className="h-4 w-4 text-gray-700" />
                        <span className="text-sm font-medium text-gray-700">Time Remaining</span>
                      </div>
                      <CountdownDisplay 
                        countdown={countdown.class} 
                        expired={countdown.class.expired} 
                        label="Class"  // This creates unique keys like "Class-days-3"
                      />
                    </div>
                  )}

                  {/* <button 
                    onClick={() => navigate('/admin/attendance')}
                    className="w-full mt-4 bg-white bg-opacity-30 hover:bg-opacity-40 px-4 py-2 rounded-lg transition-colors font-medium text-gray-800 backdrop-blur-sm border border-white border-opacity-30"
                  >
                    Mark Attendance
                  </button> */}
                </div>
              )}
            </div>
          </motion.div>

          {/* Next Poya Day Card - REMOVED ICON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Mindful gradient - Soft gold to maroon */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-300 to-red-800"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {/* REMOVED ICON */}
                  <h3 className="text-xl font-bold text-gray-800">Next Poya Day</h3>
                </div>
                <div className="flex space-x-2">
                  {!editingPoya && (
                    <button
                      onClick={() => setEditingPoya(true)}
                      className="p-2 bg-white bg-opacity-30 rounded-full hover:bg-opacity-40 transition-colors backdrop-blur-sm"
                    >
                      <FaEdit className="h-4 w-4 text-gray-700" />
                    </button>
                  )}
                  {editingPoya && (
                    <>
                      <button
                        onClick={saveNextPoya}
                        disabled={savingPoya}
                        className="p-2 bg-green-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors backdrop-blur-sm"
                      >
                        {savingPoya ? <FaSpinner className="h-4 w-4 animate-spin text-white" /> : <FaSave className="h-4 w-4 text-white" />}
                      </button>
                      <button
                        onClick={() => setEditingPoya(false)}
                        className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors backdrop-blur-sm"
                      >
                        <FaTimes className="h-4 w-4 text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingPoya ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                    <input
                      type="date"
                      value={nextPoyaDay.date}
                      onChange={(e) => setNextPoyaDay(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Poya Name</label>
                    <input
                      type="text"
                      value={nextPoyaDay.name}
                      onChange={(e) => setNextPoyaDay(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="Poya Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                    <textarea
                      value={nextPoyaDay.description}
                      onChange={(e) => setNextPoyaDay(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="Description"
                      rows="3"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">
                      {nextPoyaDay.name || 'Next Poya'}
                    </p>
                    <p className="text-gray-700 text-lg font-medium">
                      {nextPoyaDay.date ? new Date(nextPoyaDay.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric'
                      }) : 'Date not set'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaPray className="h-4 w-4 text-amber-700" />
                      <span className="text-gray-700 text-sm font-medium">{nextPoyaDay.description}</span>
                    </div>
                  </div>

                  {nextPoyaDay.date && (
                    <div className="bg-white bg-opacity-40 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaClock className="h-4 w-4 text-gray-700" />
                        <span className="text-sm font-medium text-gray-700">Time Remaining</span>
                      </div>
                      <CountdownDisplay 
                        countdown={countdown.poya} 
                        expired={countdown.poya.expired} 
                        label="Poya Day"  // This creates unique keys like "Poya Day-days-3"
                      />
                    </div>
                  )}

                  <div className="bg-white bg-opacity-40 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-sm text-gray-700 font-medium">
                      Sacred day for meditation, prayers, and spiritual reflection.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Students Modal - Exactly like reference code */}
        {showStudentsModal && selectedClass && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                   onClick={closeStudentsModal}></div>
              
              {/* Modal Panel */}
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                {/* Modal Header with Close Button */}
                <div className={`px-4 py-5 ${classConfigs[selectedClass]?.headingBg} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center`}>
                  <h3 className={`text-lg font-medium ${classConfigs[selectedClass]?.text}`}>
                    {classConfigs[selectedClass]?.name} Students - {classData[selectedClass]?.totalStudents || 0} Total
                    <span className="block text-sm mt-1 font-normal">{classConfigs[selectedClass]?.nameSi}</span>
                  </h3>
                  
                  {/* Close button */}
                  <button 
                    onClick={closeStudentsModal}
                    className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Modal Body */}
                <div className="px-4 py-5">
                  {loadingStudents ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : classStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Student
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Gender
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Age Group
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {classStudents.map(student => (
                            <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link 
                                  to={`/admin/students/${student._id}`}
                                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                                >
                                  View Details
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {student.profileImage ? (
                                      <img 
                                        className="h-10 w-10 rounded-full object-cover" 
                                        src={student.profileImage.url} 
                                        alt={`${safeDisplayName(student.name)} profile`} 
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="text-gray-500 dark:text-gray-400">
                                          {student.name?.en ? student.name.en.charAt(0) : '?'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {safeDisplayName(student.name)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {student.name?.si || ''}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {student.studentId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : ''}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {student.ageGroup}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No students found in this class
                    </div>
                  )}
                </div>
                
                {/* Modal Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 flex justify-end">
                  <Link 
                    to={`/admin/students?classCode=${selectedClass}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    <FaListUl className="mr-2" /> View All Students in This Class
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassGroups;
