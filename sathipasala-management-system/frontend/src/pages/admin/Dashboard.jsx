import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    upcomingExams: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real application, you would fetch actual data
        const studentsRes = await axios.get('/api/students', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setStats({
          totalStudents: studentsRes.data.count || 0,
          todayAttendance: 0, // You'll implement this later
          upcomingExams: 0 // You'll implement this later
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('admin.dashboard.totalStudents')}
          </h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalStudents}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('admin.dashboard.todayAttendance')}
          </h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.todayAttendance}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('admin.dashboard.upcomingExams')}
          </h2>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.upcomingExams}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('admin.dashboard.quickActions')}
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/students/register"
            className="bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 p-4 rounded-lg flex flex-col items-center justify-center"
          >
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {t('admin.dashboard.registerStudent')}
            </span>
          </a>
          <a
            href="/admin/attendance"
            className="bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 p-4 rounded-lg flex flex-col items-center justify-center"
          >
            <span className="text-green-700 dark:text-green-300 font-medium">
              {t('admin.dashboard.markAttendance')}
            </span>
          </a>
          <a
            href="/admin/exams"
            className="bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 p-4 rounded-lg flex flex-col items-center justify-center"
          >
            <span className="text-purple-700 dark:text-purple-300 font-medium">
              {t('admin.dashboard.manageExams')}
            </span>
          </a>
        </div>
      </div>

      {/* Recent Students */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('admin.dashboard.recentStudents')}
          </h2>
          <a
            href="/admin/students"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {t('common.viewAll')}
          </a>
        </div>
        <div className="p-6">
          {stats.totalStudents > 0 ? (
            <p className="text-gray-700 dark:text-gray-300">
              {t('admin.dashboard.studentsListWillAppearHere')}
            </p>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              {t('admin.dashboard.noStudentsRegistered')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;