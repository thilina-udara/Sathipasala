import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ActionButton from '../../components/common/ActionButton';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    classYear: '',
    classCode: '',
    page: 1,
    limit: 10
  });
  const [pageInfo, setPageInfo] = useState({
    totalPages: 1,
    totalStudents: 0,
    currentPage: 1
  });
  
  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch students function with useCallback
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Add all filter params
      Object.entries(filter).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`/api/students?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setStudents(response.data.data || []);
      setPageInfo({
        totalPages: response.data.pagination?.totalPages || 1,
        totalStudents: response.data.pagination?.totalItems || 0,
        currentPage: response.data.pagination?.currentPage || 1
      });
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [filter]); // Include filter dependency

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]); // fetchStudents now includes filter as dependency

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handleSortChange = (field) => {
    setFilter(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (pageNumber) => {
    setFilter(prev => ({
      ...prev,
      page: pageNumber
    }));
  };
  
  // Confirm delete function
  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };
  

  // Handle delete function
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      if (!studentToDelete || !studentToDelete._id) {
        throw new Error('Invalid student selection');
      }
      
      const response = await axios.delete(`/api/students/${studentToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Close modal and clear selected student
      setShowDeleteModal(false);
      setStudentToDelete(null);
      
      // Show success message
      setSuccessMessage(`Student "${studentToDelete.name.en}" has been deleted successfully.`);
      
      // Refresh student list
      fetchStudents();
      
      // Automatically hide the message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error deleting student:', err);
      
      let errorMessage = 'Failed to delete student. Please try again.';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Student not found. It may have been already deleted.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, filter.page - 1))}
        disabled={filter.page === 1}
        className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md text-gray-700 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
      >
        Previous
      </button>
    );
    
    // Page number buttons (show current page, and one before/after if available)
    for (let i = Math.max(1, filter.page - 1); i <= Math.min(pageInfo.totalPages, filter.page + 1); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
            i === filter.page
              ? 'bg-blue-600 text-white dark:bg-blue-700 border-blue-600 dark:border-blue-700'
              : 'text-gray-700 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(pageInfo.totalPages, filter.page + 1))}
        disabled={filter.page === pageInfo.totalPages}
        className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md text-gray-700 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
      >
        Next
      </button>
    );
    
    return buttons;
  };

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

  // Get class information
  const getClassInfo = (classCode) => {
    switch(classCode) {
      case 'ADH': 
        return { 
          name: 'Adhiṭṭhāna', 
          nameSi: 'අධිඨාන',
          color: 'bg-white text-gray-800 dark:bg-gray-800 dark:text-white border border-gray-300' 
        };
      case 'MET': 
        return { 
          name: 'Mettā', 
          nameSi: 'මෙත්තා',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
        };
      case 'KHA': 
        return { 
          name: 'Khanti', 
          nameSi: 'ඛන්ති',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
        };
      case 'NEK': 
        return { 
          name: 'Nekkhamma', 
          nameSi: 'නෙක්කම්ම',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
        };
      default: 
        return { 
          name: 'Unknown', 
          nameSi: 'නොදන්නා',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' 
        };
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
            Students
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({pageInfo.totalStudents} total)
            </span>
          </h2>
          <div>
            <Link
              to="/admin/students/register"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add New Student
            </Link>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded flex items-center">
            <div className="bg-green-100 p-1 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filter.search}
                onChange={handleFilterChange}
                placeholder="Search by name or ID"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="classYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Year
              </label>
              <input
                type="text"
                id="classYear"
                name="classYear"
                value={filter.classYear}
                onChange={handleFilterChange}
                placeholder="E.g. 2023"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {/* Class filter dropdown */}
            <div>
              <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class
              </label>
              <select
                id="classCode"
                name="classCode"
                value={filter.classCode}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Classes</option>
                <option value="ADH">Adhiṭṭhāna (අධිඨාන) - White</option>
                <option value="MET">Mettā (මෙත්තා) - Orange</option>
                <option value="KHA">Khanti (ඛන්ති) - Yellow</option>
                <option value="NEK">Nekkhamma (නෙක්කම්ම) - Blue</option>
              </select>
            </div>
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Items per page
              </label>
              <select
                id="limit"
                name="limit"
                value={filter.limit}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchStudents()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Students table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {loading && students.length === 0 ? (
            <div className="p-8 text-center">
              
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSortChange('studentId')}
                    >
                      Student ID
                      {filter.sortBy === 'studentId' && (
                        <span className="ml-1">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSortChange('name.en')}
                    >
                      Name
                      {filter.sortBy === 'name.en' && (
                        <span className="ml-1">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSortChange('ageGroup')}
                    >
                      Age Group
                      {filter.sortBy === 'ageGroup' && (
                        <span className="ml-1">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Class
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Parent Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.profileImage ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={student.profileImage.url} 
                                alt={`${student.name.en} profile`} 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {student.name.en.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.name.en}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {student.name.si}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getAgeGroupLabel(student.ageGroup)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {student.classYear} - {' '}
                        {(() => {
                          const classInfo = getClassInfo(student.classCode);
                          return (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${classInfo.color}`}>
                              {classInfo.name} ({classInfo.nameSi})
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.parentInfo?.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <ActionButton
                            type="view"
                            to={`/admin/students/${student._id}`}
                            label="View"
                          />
                          
                          <ActionButton
                            type="edit"
                            to={`/admin/students/${student._id}/edit`} 
                            label="Edit"
                          />
                          
                          <ActionButton
                            type="delete"
                            onClick={() => confirmDelete(student)}
                            label="Delete"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No students found</div>
          )}
          
          {/* Pagination */}
          {students.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(filter.page - 1) * filter.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(filter.page * filter.limit, pageInfo.totalStudents)}
                    </span>{' '}
                    of <span className="font-medium">{pageInfo.totalStudents}</span> students
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {renderPaginationButtons()}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Delete Student
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete <span className="font-semibold">{studentToDelete?.name.en}</span>? 
                        This action cannot be undone. All of this student's data including attendance records will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;