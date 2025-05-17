import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Students = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalStudents: 0
  });
  
  const [filter, setFilter] = useState({
    search: '',
    ageGroup: '',
    classYear: '',
    classCode: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchStudents();
  }, [filter, pageInfo.page, pageInfo.limit]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add filters
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.ageGroup) queryParams.append('ageGroup', filter.ageGroup);
      if (filter.classYear) queryParams.append('classYear', filter.classYear);
      if (filter.classCode) queryParams.append('classCode', filter.classCode);
      
      // Add sorting
      queryParams.append('sortBy', filter.sortBy);
      queryParams.append('sortOrder', filter.sortOrder);
      
      // Add pagination
      queryParams.append('page', pageInfo.page);
      queryParams.append('limit', pageInfo.limit);

      const res = await axios.get(`/api/students?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setStudents(res.data.data || []);
      setPageInfo({
        ...pageInfo,
        totalPages: res.data.totalPages || 1,
        totalStudents: res.data.totalCount || 0
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setPageInfo(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handleSortChange = (field) => {
    setFilter(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pageInfo.totalPages) return;
    setPageInfo(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPageInfo(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
            {t('admin.students.allStudents')} 
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({pageInfo.totalStudents} {t('admin.students.totalStudents')})
            </span>
          </h2>
          
          <div className="flex space-x-2">
            <Link
              to="/admin/students/register"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {t('admin.students.registerNewStudent')}
            </Link>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.search')}
            </label>
            <input
              type="text"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder={t('admin.students.searchPlaceholder')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.students.ageGroup')}
            </label>
            <select
              name="ageGroup"
              value={filter.ageGroup}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">{t('admin.filters.all')}</option>
              <option value="3-6">3-6 {t('admin.students.years')}</option>
              <option value="7-10">7-10 {t('admin.students.years')}</option>
              <option value="11-14">11-14 {t('admin.students.years')}</option>
              <option value="15-17">15-17 {t('admin.students.years')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.students.classYear')}
            </label>
            <input
              type="text"
              name="classYear"
              value={filter.classYear}
              onChange={handleFilterChange}
              placeholder={new Date().getFullYear().toString()}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.students.classCode')}
            </label>
            <select
              name="classCode"
              value={filter.classCode}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">{t('admin.filters.all')}</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
            {error}
          </div>
        )}
        
        {/* Students Table */}
        {loading && students.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded">
            {t('admin.students.noStudentsFound')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSortChange('studentId')}
                  >
                    {t('admin.students.studentId')}
                    {filter.sortBy === 'studentId' && (
                      <span className="ml-1">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSortChange('name.en')}
                  >
                    {t('admin.students.nameEnglish')}
                    {filter.sortBy === 'name.en' && (
                      <span className="ml-1">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.students.ageGroup')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSortChange('classYear')}
                  >
                    {t('admin.students.class')}
                    {filter.sortBy === 'classYear' && (
                      <span className="ml-1">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.students.parentPhone')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {student.name?.en || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {student.ageGroup || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {student.classYear}-{student.classCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {student.parentInfo?.phone || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/students/${student._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        {t('admin.view')}
                      </Link>
                      <Link
                        to={`/admin/students/${student._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {t('admin.edit')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <select
              value={pageInfo.limit}
              onChange={handleLimitChange}
              className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="10">10 / {t('admin.pagination.page')}</option>
              <option value="25">25 / {t('admin.pagination.page')}</option>
              <option value="50">50 / {t('admin.pagination.page')}</option>
              <option value="100">100 / {t('admin.pagination.page')}</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pageInfo.page === 1}
              className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              &laquo;
            </button>
            <button
              onClick={() => handlePageChange(pageInfo.page - 1)}
              disabled={pageInfo.page === 1}
              className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              &lsaquo;
            </button>
            
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {t('admin.pagination.page')} {pageInfo.page} {t('admin.pagination.of')} {pageInfo.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pageInfo.page + 1)}
              disabled={pageInfo.page === pageInfo.totalPages}
              className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              &rsaquo;
            </button>
            <button
              onClick={() => handlePageChange(pageInfo.totalPages)}
              disabled={pageInfo.page === pageInfo.totalPages}
              className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;