import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Determine page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/admin/dashboard') {
      return t('admin.dashboard.title');
    } else if (path === '/admin/students/register') {
      return t('admin.students.registerNewStudent');
    } else if (path.startsWith('/admin/students')) {
      return t('students');
    } else if (path.startsWith('/admin/attendance')) {
      return t('attendance');
    } else if (path.startsWith('/admin/exams')) {
      return t('exams');
    } else if (path.startsWith('/admin/users')) {
      return t('users');
    } else if (path === '/admin/settings') {
      return t('settings');
    }

    return t('admin.dashboard.title');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <Sidebar isMobile closeMobileMenu={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation - Only show page title */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 py-3 flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-3"
            >
              <span className="text-xl">☰</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;