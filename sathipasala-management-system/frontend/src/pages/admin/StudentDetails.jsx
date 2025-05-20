import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPencilAlt, FaCalendarAlt } from 'react-icons/fa';
import ClassBadge from '../../components/common/ClassBadge';

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchStudentData function to load student data
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Check if student was just updated
      const studentUpdated = localStorage.getItem('studentUpdated');
      if (studentUpdated === 'true') {
        console.log('Student was just updated, forcing fresh data fetch');
      }
      
      // Use strong cache-busting with timestamp
      const timestamp = new Date().getTime();
      const response = await axios.get(`/api/students/${id}?_=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch student details');
      }
      
      console.log('Fetched student details:', response.data.data);
      setStudent(response.data.data);
      
      // Remove the flag after successful fetch
      if (studentUpdated === 'true') {
        localStorage.removeItem('studentUpdated');
        console.log('Cleared student updated flag');
      }
      
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError(error.response?.data?.message || 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only once when component mounts
  useEffect(() => {
    fetchStudentData();
    
    return () => {
      // Clear browser cache when leaving component
      if (window.caches) {
        // Attempt to clear application cache
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    };
  }, [id]);

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
        <Link to="/admin/students" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Students List
        </Link>
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

  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    if (
      today.getMonth() < birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    
    return age;
  };

  const studentAge = calculateAge(student.dateOfBirth);

  // Get age group label
  const getAgeGroupLabel = (ageGroup) => {
    switch(ageGroup) {
      case '3-6': return '3-6 years (Adhiṭṭhāna)';
      case '7-10': return '7-10 years (Mettā)';
      case '11-13': return '11-13 years (Khanti)';
      case '14+': return '14+ years (Nekkhamma)';
      default: return ageGroup;
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link
              to="/admin/students"
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Student Details
            </h2>
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/admin/students/${id}/edit`}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              <FaPencilAlt className="mr-2" />
              Edit
            </Link>
            <Link
              to={`/admin/students/${id}/attendance`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <FaCalendarAlt className="mr-2" />
              View Attendance
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              {/* Student Photo */}
              <div className="md:w-1/4 mb-6 md:mb-0 flex flex-col items-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 mb-4">
                  {student.profileImage ? (
                    <img
                      src={student.profileImage.url}
                      alt={`${student.name.en} profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-5xl">
                        {student.name.en.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{student.name.en}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.name.si}</p>
                  <div className="mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {student.studentId}
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="md:w-3/4 md:pl-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                      Personal Information
                    </h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Age:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{studentAge} years</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {new Date(student.dateOfBirth).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Age Group:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {getAgeGroupLabel(student.ageGroup)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                      Class Information
                    </h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Class:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {student.classYear} - <ClassBadge classCode={student.classCode} />
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                      Parent Information
                    </h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent Name:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {student.parentInfo?.name?.en || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {student.parentInfo?.phone || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {student.parentInfo?.email || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {student.parentInfo?.address || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact:</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {student.emergencyContact || student.parentInfo?.phone || '-'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Attendance Summary
              </h3>
              <Link
                to={`/admin/students/${id}/attendance`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Full History
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
                <h4 className="text-sm text-gray-500 dark:text-gray-400">Present</h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {student.attendanceSummary?.presentDays || 0}
                </p>
                <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 dark:bg-green-400" 
                    style={{ width: `${student.attendanceSummary?.presentRate || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4 text-center">
                <h4 className="text-sm text-gray-500 dark:text-gray-400">Absent</h4>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {student.attendanceSummary?.absentDays || 0}
                </p>
                <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 dark:bg-red-400" 
                    style={{ width: `${student.attendanceSummary?.absentRate || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center">
                <h4 className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {student.attendanceSummary?.attendanceRate || 0}%
                </p>
                <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-400" 
                    style={{ width: `${student.attendanceSummary?.attendanceRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Last attendance:</span> {student.attendanceSummary?.lastAttendance ? new Date(student.attendanceSummary?.lastAttendance).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;