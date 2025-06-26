import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaUsers, FaCalendarCheck, FaUserGraduate, FaChartBar, FaCog, FaExclamationTriangle, FaUser, FaUserCog, FaBookOpen, FaChevronDown, FaChevronRight, FaImages, FaSlidersH } from 'react-icons/fa';

const Sidebar = ({ isMobile, closeMobileMenu }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-600 hover:text-white';
  };

  const handleLogout = () => {
    logout(); // Clear auth context
    // ✅ Fixed: Redirect to secure admin login instead of general login
    navigate('/bsp/login/admin');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLanguage = i18n.language || 'en';

  const NavItem = ({ to, icon, label, hasSubMenu, subMenuKey, children }) => {
    const isMenuActive = to ? isActive(to) : openSubMenu === subMenuKey;
    
    return (
      <div className="mb-1">
        <div 
          onClick={() => hasSubMenu ? toggleSubMenu(subMenuKey) : closeMobileMenu && closeMobileMenu()}
          className={`flex items-center py-2 px-4 rounded-md cursor-pointer 
            ${isMenuActive 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
              : 'text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-200'
            } transition-colors duration-200`}
        >
          {to ? (
            <Link to={to} className="flex items-center flex-1" onClick={closeMobileMenu}>
              <span className="text-lg mr-3">{icon}</span>
              {!isCollapsed && (
                <span className="font-medium">{label}</span>
              )}
            </Link>
          ) : (
            <>
              <span className="text-lg mr-3">{icon}</span>
              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1">{label}</span>
                  {hasSubMenu && (
                    <span className="text-sm">
                      {openSubMenu === subMenuKey ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  )}
                </>
              )}
            </>
          )}
        </div>
        
        {hasSubMenu && openSubMenu === subMenuKey && !isCollapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const SubNavItem = ({ to, label }) => (
    <Link
      to={to}
      onClick={closeMobileMenu}
      className={`block py-2 px-4 text-sm rounded-md transition-colors duration-200 ${
        isActive(to)
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
          : 'text-gray-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-200'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className={`
      ${isMobile 
        ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' 
        : `${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`
      } 
      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shadow-lg
    `}>
      
      {/* Close button for mobile */}
      {isMobile && (
        <button
          onClick={closeMobileMenu}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white z-10"
        >
          <span className="text-2xl">×</span>
        </button>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mr-3">
              🧘
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  {t('sidebar.title')}
                </h2>
              </div>
            )}
          </div>
          {!isMobile && !isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FaChevronRight />
            </button>
          )}
          {!isMobile && isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FaChevronDown />
            </button>
          )}
        </div>
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
          icon={<FaHome />} 
          label={t('sidebar.dashboard')} 
        />

        <NavItem 
          hasSubMenu={true}
          subMenuKey="students" 
          icon={<FaUsers />} 
          label={t('sidebar.students')}
        >
          <SubNavItem to="/admin/students" label={t('sidebar.allStudents')} />
          <SubNavItem to="/admin/students/register" label={t('sidebar.registerStudent')} />
          <SubNavItem to="/admin/classes" label={t('sidebar.classGroups')} />
        </NavItem>

        <NavItem 
          to="/admin/home-swiper"
          icon={<FaSlidersH />}
          label="Manage Homepage Swiper"
        />
        <NavItem 
          to="/admin/gallery"
          icon={<FaImages />}
          label="Manage Gallery"
        />

        <NavItem 
          hasSubMenu={true}
          subMenuKey="attendance" 
          icon={<FaCalendarCheck />} 
          label={t('sidebar.attendance')}
        >
          <SubNavItem to="/admin/attendance" label={t('sidebar.markAttendance')} />
          <SubNavItem to="/admin/attendance/analysis" label={t('sidebar.attendanceAnalysis')} />
        </NavItem>

        <NavItem 
          hasSubMenu={true}
          subMenuKey="exams" 
          icon={<FaBookOpen />} 
          label={t('sidebar.exams')}
        >
          <SubNavItem to="/admin/exams" label={t('manageExams')} />
          <SubNavItem to="/admin/exams/results" label={t('examResults')} />
          <SubNavItem to="/admin/exams/reports" label={t('examReports')} />
        </NavItem>

        <NavItem 
          hasSubMenu={true}
          subMenuKey="users" 
          icon={<FaUserCog />} 
          label={t('sidebar.users')}
        >
          <SubNavItem to="/admin/users/teachers" label={t('teachers')} />
          <SubNavItem to="/admin/users/parents" label={t('parents')} />
          <SubNavItem to="/admin/users/accounts" label={t('accounts')} />
        </NavItem>

        <NavItem 
          to="/admin/settings" 
          icon={<FaCog />} 
          label={t('settings')} 
        />
      </div>

      {/* Utility section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="space-y-2">
          {/* Language Switcher */}
          <div className="mb-4">
            {!isCollapsed && (
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('sidebar.language')}
              </label>
            )}
            <div className="flex space-x-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentLanguage === 'en'
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-500 text-gray-300 hover:bg-blue-700 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('si')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentLanguage === 'si'
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-500 text-gray-300 hover:bg-blue-700 hover:text-white'
                }`}
              >
                සිංහල
              </button>
            </div>
          </div>
          
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