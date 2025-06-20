import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FaUserGraduate, 
  FaCalendarCheck, 
  FaArrowRight, 
  FaSync, 
  FaExclamationTriangle, 
  FaUserFriends, 
  FaChevronRight
} from 'react-icons/fa';

// Import ShadCN components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ClassGroups = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classStats, setClassStats] = useState({
    ADH: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 },
    MET: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 },
    KHA: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 },
    NEK: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 }
  });
  const [teacherAssignments, setTeacherAssignments] = useState({
    ADH: { name: 'Mihiri Rathnayake' },
    MET: { name: 'Anura Bandara' },
    KHA: { name: 'Tharaka Fernando' },
    NEK: { name: 'Priya Gunasekara' }
  });
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Student modal state
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Define class styles
  const classStyles = {
    ADH: {
      name: 'Adhiṭṭhāna',
      nameSi: 'අධිඨාන',
      cardBg: 'bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800',
      badge: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700',
      progressColor: 'bg-slate-600 dark:bg-slate-400',
      borderColor: 'border-t-slate-500',
      buttonBg: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600',
      iconColor: 'text-slate-700 dark:text-slate-300',
      description: '3-6 years'
    },
    MET: {
      name: 'Mettā',
      nameSi: 'මෙත්තා',
      cardBg: 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/30 dark:to-slate-800',
      badge: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-50 border border-amber-200 dark:border-amber-800',
      progressColor: 'bg-amber-500 dark:bg-amber-400',
      borderColor: 'border-t-amber-500',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600',
      iconColor: 'text-amber-600 dark:text-amber-400',
      description: '7-10 years'
    },
    KHA: {
      name: 'Khanti',
      nameSi: 'ඛන්ති',
      cardBg: 'bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/30 dark:to-slate-800',
      badge: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-50 border border-yellow-200 dark:border-yellow-800',
      progressColor: 'bg-yellow-500 dark:bg-yellow-400',
      borderColor: 'border-t-yellow-500',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      description: '11-13 years'
    },
    NEK: {
      name: 'Nekkhamma',
      nameSi: 'නෙක්කම්ම',
      cardBg: 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800',
      badge: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50 border border-blue-200 dark:border-blue-800',
      progressColor: 'bg-blue-500 dark:bg-blue-400',
      borderColor: 'border-t-blue-500',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: '14+ years'
    }
  };

  // Helper function for authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Calculate total attendance for today
  const getTodayTotalAttendance = (stats) => {
    return Object.values(stats).reduce(
      (sum, classStat) => sum + (classStat.todayAttendance || 0),
      0
    );
  };

  // Fetch class data with today's attendance
  const fetchClassData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize stats with today's attendance field
      const updatedStats = {
        ADH: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 },
        MET: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 },
        KHA: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 },
        NEK: { totalStudents: 0, attendanceRate: 0, lastClassDate: null, todayAttendance: 0 }
      };
      
      // Check if we have a valid token first
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }
      
      try {
        // Step 1: Get student counts with better error handling
        const studentCountsResponse = await axios.get('/api/stats/student-counts-by-class', {
          headers: getAuthHeaders()
        }).catch(err => {
          if (err.response?.status === 401) {
            console.error("Authentication failed: Token may be expired");
            throw new Error("Your session has expired. Please log in again.");
          }
          console.warn("Failed to fetch student counts:", err);
          return { data: { success: false } };
        });
        
        if (studentCountsResponse.data && studentCountsResponse.data.success) {
          // Update student counts
          const counts = studentCountsResponse.data.data;
          Object.keys(counts).forEach(code => {
            if (updatedStats[code]) {
              updatedStats[code].totalStudents = counts[code] || 0;
            }
          });
          console.log("Student count data loaded:", counts);
        } else {
          // Fallback: fetch student list and count manually
          try {
            const studentsResponse = await axios.get('/api/students', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              params: { limit: 500 }
            });
            
            if (studentsResponse.data && studentsResponse.data.success) {
              const students = studentsResponse.data.data || [];
              const classCounts = { ADH: 0, MET: 0, KHA: 0, NEK: 0 };
              
              students.forEach(student => {
                if (student.classCode && classCounts.hasOwnProperty(student.classCode)) {
                  classCounts[student.classCode]++;
                }
              });
              
              Object.keys(classCounts).forEach(code => {
                updatedStats[code].totalStudents = classCounts[code];
              });
              console.log("Student counts calculated:", classCounts);
            } else {
              throw new Error("Could not fetch students");
            }
          } catch (err) {
            console.error("Could not determine student counts:", err);
            // Use mock student counts
            updatedStats.ADH.totalStudents = 25;
            updatedStats.MET.totalStudents = 32;
            updatedStats.KHA.totalStudents = 28;
            updatedStats.NEK.totalStudents = 19;
          }
        }
        
        // Step 2: Get today's attendance - Fix to properly count present students
        try {
          const today = new Date().toISOString().split('T')[0];
          console.log("Fetching attendance for date:", today);
          
          const todayAttendanceResponse = await axios.get(`/api/attendance/date/${today}`, {
            headers: getAuthHeaders()
          });
          if (todayAttendanceResponse?.data?.success) {
            const attendanceByClass = { ADH: 0, MET: 0, KHA: 0, NEK: 0 };
            todayAttendanceResponse.data.data.forEach(record => {
              if (record.status === 'present' && record.studentId?.classCode) {
                attendanceByClass[record.studentId.classCode]++;
              }
            });
            Object.keys(attendanceByClass).forEach(code => {
              updatedStats[code].todayAttendance = attendanceByClass[code];
            });
          }
        } catch (err) {
          console.error("Error fetching today's attendance:", err);
          // Keep values as is (zero) if there's an error
        }
        
        // Step 3: Get attendance rates (keep this as is)
        const attendanceRatesResponse = await axios.get('/api/stats/attendance-by-class', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(err => {
          console.warn("Failed to fetch attendance rates:", err);
          return { data: { success: false } };
        });
        
        if (attendanceRatesResponse.data && attendanceRatesResponse.data.success) {
          const rates = attendanceRatesResponse.data.data;
          Object.keys(rates).forEach(code => {
            if (updatedStats[code]) {
              updatedStats[code].attendanceRate = rates[code]?.rate || 0;
              updatedStats[code].lastClassDate = rates[code]?.lastDate || null;
            }
          });
          console.log("Attendance rates loaded:", rates);
        } else {
          // Use mock attendance rates
          Object.keys(updatedStats).forEach(code => {
            updatedStats[code].attendanceRate = Math.round(70 + Math.random() * 20); // 70-90%
            updatedStats[code].lastClassDate = new Date().toISOString().split('T')[0];
          });
        }
        
        // Update class stats with all data
        setClassStats(updatedStats);
        
      } catch (error) {
        // Check for auth errors
        if (error.message.includes("authentication") || error.message.includes("session")) {
          // Handle authentication errors
          setError(error.message);
          // Optionally redirect to login
          // setTimeout(() => navigate('/login'), 3000);
        } else {
          console.error('API error:', error);
          // Use mock data for development
          setClassStats({
            ADH: { totalStudents: 25, attendanceRate: 86, lastClassDate: new Date().toISOString(), todayAttendance: 21 },
            MET: { totalStudents: 32, attendanceRate: 78, lastClassDate: new Date().toISOString(), todayAttendance: 25 },
            KHA: { totalStudents: 28, attendanceRate: 92, lastClassDate: new Date().toISOString(), todayAttendance: 24 },
            NEK: { totalStudents: 19, attendanceRate: 85, lastClassDate: new Date().toISOString(), todayAttendance: 16 }
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error in fetchClassData:', error);
      setError(error.message || 'Failed to load class information. Using sample data for display.');
      
      // Fallback mock data
      setClassStats({
        ADH: { totalStudents: 25, attendanceRate: 86, lastClassDate: new Date().toISOString(), todayAttendance: 21 },
        MET: { totalStudents: 32, attendanceRate: 78, lastClassDate: new Date().toISOString(), todayAttendance: 25 },
        KHA: { totalStudents: 28, attendanceRate: 92, lastClassDate: new Date().toISOString(), todayAttendance: 24 },
        NEK: { totalStudents: 19, attendanceRate: 85, lastClassDate: new Date().toISOString(), todayAttendance: 16 }
      });
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  // Add this effect to refresh data when the component gains focus
  useEffect(() => {
    // Initial load
    fetchClassData();
    
    // Create event listeners for tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible again
        fetchClassData();
      }
    };
    
    // Listen for visibility changes (when user switches tabs and comes back)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchClassData]);

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    fetchClassData();
  }, [refreshing, fetchClassData]);

  // View students in a specific class
  const handleViewStudents = useCallback(async (classCode) => {
    try {
      setLoadingStudents(true);
      setSelectedClass(classCode);
      setShowStudentsModal(true);
      
      try {
        // Fetch students by class code
        const response = await axios.get(`/api/students`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            classCode,
            limit: 100
          }
        });
        
        if (response.data.success) {
          setClassStudents(response.data.data || []);
          console.log(`Loaded ${response.data.data?.length || 0} students for class ${classCode}`);
        } else {
          throw new Error('Failed to fetch students');
        }
      } catch (apiError) {
        console.error('API error when fetching students:', apiError);
        
        // Generate some mock students for development
        const mockStudents = Array.from({ length: 10 }, (_, i) => ({
          _id: `mock-${i}`,
          studentId: `SP2023${classCode}${String(i+1).padStart(3, '0')}`,
          name: {
            en: `${classCode} Student ${i+1}`,
            si: `${classCode} සිසුවා ${i+1}`
          },
          gender: Math.random() > 0.5 ? 'M' : 'F',
          classCode,
          profileImage: Math.random() > 0.3 ? {
            url: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`
          } : null
        }));
        
        setClassStudents(mockStudents);
      }
    } catch (err) {
      console.error('Error preparing student data:', err);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Close student modal
  const closeStudentsModal = useCallback(() => {
    setShowStudentsModal(false);
    setTimeout(() => {
      setSelectedClass(null);
      setClassStudents([]);
    }, 300);
  }, []);

  // Handle class attendance button click
  const handleClassAttendance = (classCode) => {
    navigate(`/admin/attendance?classCode=${classCode}`);
  };

  // View all students in a class
  const handleViewAllStudents = (classCode) => {
    closeStudentsModal(); // Close the modal first
    setTimeout(() => {
      navigate(`/admin/students?classCode=${classCode}`);
    }, 300);
  };

  // Helper for name display
  const safeDisplayName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj.en || nameObj.si || '';
  };

  // Calculate summary statistics
  const totalStudents = Object.values(classStats).reduce(
    (sum, stats) => sum + (stats.totalStudents || 0), 0
  );
  
  const todayTotalAttendance = Object.values(classStats).reduce(
    (sum, stats) => sum + (stats.todayAttendance || 0), 0
  );
  
  const totalClasses = Object.keys(classStats).length;
  const averageAttendance = totalClasses > 0
    ? Math.round(Object.values(classStats).reduce(
      (sum, stats) => sum + (stats.attendanceRate || 0), 0
    ) / totalClasses)
    : 0;

  // Card skeleton for loading state
  const CardSkeleton = () => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <Skeleton className="h-[260px] w-full" />
    </div>
  );

  return (
    <div className="container p-6 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Class Groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage class groups and view statistics
          </p>
        </div>

        <div className="mt-4 md:mt-0 space-x-2">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="relative"
          >
            <FaSync className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/attendance')}
          >
            <FaCalendarCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/15 border-l-4 border-destructive p-4 mb-6 rounded-md shadow-sm"
        >
          <div className="flex items-start">
            <FaExclamationTriangle className="text-destructive mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-destructive">Notice</h3>
              <p className="mt-1 text-destructive/80">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-destructive/30 text-destructive"
                onClick={handleRefresh}
              >
                <FaSync className="mr-2 h-3 w-3" /> Try Again
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Students Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total Students</span>
              <FaUserFriends className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>Across all classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents}</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1 font-medium"> / </span>
              <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                {todayTotalAttendance}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">present today</span>
            </div>
            
            <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-green-500 dark:bg-green-600"
                style={{ 
                  width: totalStudents > 0 
                    ? `${Math.min(100, (todayTotalAttendance / totalStudents) * 100)}%` 
                    : '0%' 
                }}
              />
            </div>
            
            <Link
              to="/admin/students"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-3 group"
            >
              View all students
              <FaArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" size={10} />
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Average Attendance</span>
              <FaCalendarCheck className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>Across all active classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{averageAttendance}%</div>
            <Progress value={averageAttendance} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sunday Classes</span>
              <span className="h-5 w-5 flex items-center justify-center rounded-full bg-green-100 text-green-600">4</span>
            </CardTitle>
            <CardDescription>Age-based groups</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/admin/attendance"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-2 group"
            >
              Mark attendance
              <FaArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" size={10} />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Class Cards */}
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Class Overview</h2>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.keys(classStyles).map((classCode, index) => {
            const style = classStyles[classCode];
            const stats = classStats[classCode] || { totalStudents: 0, attendanceRate: 0, todayAttendance: 0 };
            
            return (
              <motion.div
                key={classCode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden border-t-4 ${style.borderColor} shadow-sm hover:shadow-md transition-all duration-200`}
                >
                  <div className={style.cardBg}>
                    <CardHeader className="pb-1 pt-3 px-3">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className={`text-xs ${style.badge}`}>
                          {style.description}
                        </Badge>
                        <FaUserGraduate className={`h-4 w-4 ${style.iconColor}`} />
                      </div>
                      <CardTitle className="mt-3 flex flex-col">
                        <span className="text-base text-gray-900 dark:text-white">{style.name}</span>
                        <span className="text-muted-foreground text-xs font-normal mt-0.5">{style.nameSi}</span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pb-1 px-3">
                      <div className="space-y-3">
                        {/* Student count with today's attendance section */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Students</span>
                          <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            <span className="font-medium">{stats.totalStudents}</span>
                            <span className="text-gray-500 dark:text-gray-400 mx-0.5">/</span>
                            <span className={stats.todayAttendance > 0 ? 'font-medium text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                              {stats.todayAttendance}
                            </span>
                            <span className="ml-0.5 text-xs text-gray-500 dark:text-gray-400">today</span>
                          </Badge>
                        </div>
                        
                        {/* Attendance Rate section with progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Attendance Rate</span>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">{stats.attendanceRate || 0}%</span>
                          </div>
                          <Progress 
                            value={stats.attendanceRate || 0} 
                            className={`h-1 ${style.progressColor}`} 
                          />
                        </div>
                        
                        {/* Teacher assignment */}
                        <div className="flex justify-between items-center">
                          <div className="text-xs">
                            <div className="text-muted-foreground font-medium">Teacher</div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {teacherAssignments[classCode]?.name || 'Not Assigned'}
                            </div>
                          </div>
                          
                          {stats.lastClassDate && (
                            <Badge variant="secondary" className="text-xs">
                              Last: {new Date(stats.lastClassDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit'})}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between gap-1 pt-1 pb-3 px-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => handleViewStudents(classCode)}
                      >
                        Students
                      </Button>
                      <Button 
                        size="sm" 
                        className={`flex-1 text-white text-xs ${style.buttonBg}`}
                        onClick={() => handleClassAttendance(classCode)}
                      >
                        <FaCalendarCheck className="mr-1 h-3 w-3" />
                        Attendance
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Students Modal - Using a larger table layout */}
      <Dialog open={showStudentsModal} onOpenChange={closeStudentsModal}>
        <DialogContent className="max-w-6xl p-0 gap-0 w-[95vw]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              {selectedClass && (
                <>
                  <span>{classStyles[selectedClass]?.name} Students</span>
                  <Badge variant="outline" className={selectedClass && classStyles[selectedClass]?.badge}>
                    {classStats[selectedClass]?.totalStudents || 0} Students
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {selectedClass && classStyles[selectedClass]?.nameSi} - {selectedClass && classStyles[selectedClass]?.description}
            </DialogDescription>
          </DialogHeader>

          {/* Modal Body - WIDER table */}
          <div className="p-6 overflow-x-auto" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-blue-600 dark:text-blue-300">Loading students...</p>
              </div>
            ) : classStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <FaUserGraduate className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-200">No students found in this class</p>
                <p className="text-blue-400 mt-1">Try adding students to this class</p>
              </div>
            ) : (
              <table className="w-full border-collapse divide-y divide-blue-200 dark:divide-blue-800 table-fixed">
                <colgroup>
                  <col style={{ width: '35%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead className="bg-blue-50 dark:bg-blue-900/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-blue-950 divide-y divide-blue-100 dark:divide-blue-800">
                  {classStudents.map((student, idx) => (
                    <tr
                      key={student._id}
                      className={`hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors ${idx % 2 === 0 ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {student.profileImage?.url ? (
                            <AvatarImage src={student.profileImage.url} alt={safeDisplayName(student.name)} />
                          ) : (
                            <AvatarFallback className="bg-blue-400 text-white text-lg font-bold">
                              {safeDisplayName(student.name).charAt(0) || "?"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-semibold text-base text-blue-900 dark:text-blue-100">{safeDisplayName(student.name)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded px-3 py-1 font-mono text-sm">
                          {student.studentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.gender === "M" ? (
                          <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded px-3 py-1 text-sm font-semibold">Male</span>
                        ) : student.gender === "F" ? (
                          <span className="inline-block bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100 rounded px-3 py-1 text-sm font-semibold">Female</span>
                        ) : (
                          <span className="inline-block bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-1 text-sm font-semibold">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          size="default"
                          variant="outline"
                          className="border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                          onClick={() => navigate(`/admin/students/${student._id}`)}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal Footer */}
          <DialogFooter className="p-5 border-t flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} in {selectedClass && classStyles[selectedClass]?.name}
            </div>
            
            <Button 
              onClick={() => selectedClass && handleViewAllStudents(selectedClass)}
              variant="default"
              className="gap-2"
              size="default"
            >
              View All Students in Class
              <FaArrowRight className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassGroups;