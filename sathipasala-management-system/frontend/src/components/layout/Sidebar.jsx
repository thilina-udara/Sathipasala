import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isMobile, closeMobileMenu }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState('');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSubMenu = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? '' : menu);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en');
  };

  const NavItem = ({ to, icon, label, hasSubMenu, subMenuKey, children }) => {
    const isMenuActive = to ? isActive(to) : openSubMenu === subMenuKey;
    
    return (
      <div className="mb-1">
        <div 
          onClick={() => hasSubMenu ? toggleSubMenu(subMenuKey) : closeMobileMenu && closeMobileMenu()}
          className={`flex items-center py-2 px-4 rounded-md cursor-pointer 
            ${isMenuActive 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
        >
          {to ? (
            <Link to={to} className="flex items-center w-full">
              <span className="text-xl mr-3">{icon}</span>
              {!isCollapsed && <span className="font-medium">{label}</span>}
            </Link>
          ) : (
            <>
              <span className="text-xl mr-3">{icon}</span>
              {!isCollapsed && (
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{label}</span>
                  <span className={`transform transition-transform ${openSubMenu === subMenuKey ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        
        {hasSubMenu && openSubMenu === subMenuKey && !isCollapsed && (
          <div className="ml-10 mt-1 space-y-1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const SubNavItem = ({ to, label }) => (
    <Link 
      to={to} 
      className={`block py-2 px-3 rounded-md ${isActive(to) 
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'}`}
      onClick={closeMobileMenu && closeMobileMenu}
    >
      {label}
    </Link>
  );

  return (
    <div 
      className={`h-screen flex flex-col bg-white dark:bg-gray-900 ${isCollapsed ? 'w-20' : 'w-64'} 
        border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out
        ${isMobile ? 'absolute top-0 left-0 z-50 shadow-lg' : 'relative'}`}
    >
      {/* Sidebar header/logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            A
          </span>
          {!isCollapsed && (
            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
              {t('Admin Dashboard')}
            </span>
          )}
        </div>
        {!isMobile && (
          <button 
            onClick={toggleCollapse} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        )}
        {isMobile && (
          <button 
            onClick={closeMobileMenu} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Admin profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            {user?.name?.en?.charAt(0) || 'A'}
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <div className="font-medium text-gray-800 dark:text-white">
                {user?.name?.en || 'Admin User'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('adminRole')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <NavItem 
          to="/admin/dashboard" 
          icon="📊" 
          label={t('dashboard')} 
        />

        <NavItem 
          hasSubMenu={true}
          subMenuKey="students" 
          icon="👨‍🎓" 
          label={t('students')}
        >
          <SubNavItem to="/admin/students" label={t('allStudents')} />
          <SubNavItem to="/admin/students/register" label={t('registerStudent')} />
          <SubNavItem to="/admin/students/classes" label={t('classGroups')} />
        </NavItem>

        <NavItem 
          hasSubMenu={true}
          subMenuKey="attendance" 
          icon="📝" 
          label={t('attendance')}
        >
          <SubNavItem to="/admin/attendance" label={t('markAttendance')} />
          <SubNavItem to="/admin/attendance/reports" label={t('attendanceReports')} />
        </NavItem>

        <NavItem 
          hasSubMenu={true}
          subMenuKey="exams" 
          icon="📚" 
          label={t('sidebar.exams')}
        >
          <SubNavItem to="/admin/exams" label={t('manageExams')} />
          <SubNavItem to="/admin/exams/results" label={t('examResults')} />
          <SubNavItem to="/admin/exams/reports" label={t('examReports')} />
        </NavItem>

        <NavItem 
          hasSubMenu={true}
          subMenuKey="users" 
          icon="👥" 
          label={t('sidebar.users')}
        >
          <SubNavItem to="/admin/users/teachers" label={t('teachers')} />
          <SubNavItem to="/admin/users/parents" label={t('parents')} />
          <SubNavItem to="/admin/users/accounts" label={t('accounts')} />
        </NavItem>

        <NavItem 
          to="/admin/settings" 
          icon="⚙️" 
          label={t('settings')} 
        />
      </div>

      {/* Utility section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-3">
          <button 
            onClick={toggleLanguage}
            className="flex items-center py-2 px-4 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="text-xl mr-3">🌐</span>
            {!isCollapsed && (
              <span>{i18n.language === 'en' ? 'සිංහල' : 'English'}</span>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center py-2 px-4 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="text-xl mr-3">🚪</span>
            {!isCollapsed && (
              <span>{t('logout')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;