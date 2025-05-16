import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import StudentRegistrationForm from '../../components/admin/StudentRegistration';
import { useAuth } from '../../contexts/AuthContext';

const StudentRegistrationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.students.registerNewStudent')}
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {t('common.backToDashboard')}
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              {user?.name?.en || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StudentRegistrationForm />
      </main>
    </div>
  );
};

export default StudentRegistrationPage;