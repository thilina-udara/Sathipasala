import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <span className="text-xl">☰</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('admin.dashboard.title')}
            </h1>

            <div className="flex items-center space-x-3">
              {/* Notifications Icon (placeholder) */}
              <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <span className="text-xl">🔔</span>
              </button>
            </div>
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