import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { FaUserGraduate, FaChalkboardTeacher, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { i18n } = useTranslation();
  const { login, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('student'); // 'student' or 'admin'
  
  // Language state
  const [language, setLanguage] = useState(i18n.language || 'en');
  
  // Handle language switch
  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError('');
    
    try {
      const user = await login(formData.email, formData.password);
      
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'teacher') {
        navigate('/admin/dashboard');
      } else if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'parent') {
        navigate('/parent/dashboard');
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot ID or password
  const handleForgotCredentials = (type) => {
    setLocalError(`${type === 'id' ? 'Forgot ID' : 'Forgot password'} feature will be implemented soon`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Back to Home Link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
        <FaArrowLeft className="mr-2" />
        <span>{language === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}</span>
      </Link>
      
      {/* Language Switcher */}
      <div className="absolute top-6 right-6">
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 flex">
          <button
            onClick={() => switchLanguage('en')}
            className={`px-3 py-1 rounded-md transition ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => switchLanguage('si')}
            className={`px-3 py-1 rounded-md transition ${
              language === 'si'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            සිංහල
          </button>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <img 
                src="/images/logo.png" 
                alt="Sathipasala Logo" 
                className="h-20 w-auto"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/80?text=🧘';
                }}
              />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-800 dark:text-white">
              {language === 'si' ? 'සතිපාසල' : 'Sathipasala'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {language === 'si' ? 'ඔබගේ ගිණුමට පිවිසෙන්න' : 'Sign in to your account'}
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md mb-6 flex">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 py-3 flex justify-center items-center rounded-md transition ${
                userType === 'student'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FaUserGraduate className="mr-2" />
              <span>{language === 'si' ? 'ශිෂ්‍ය' : 'Student'}</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-3 flex justify-center items-center rounded-md transition ${
                userType === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FaChalkboardTeacher className="mr-2" />
              <span>{language === 'si' ? 'පරිපාලක' : 'Admin'}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              {userType === 'student' ? (
                <>
                  <FaUserGraduate className="mr-2 text-blue-600 dark:text-blue-400" />
                  <span>{language === 'si' ? 'ශිෂ්‍ය ලොගින්' : 'Student Login'}</span>
                </>
              ) : (
                <>
                  <FaChalkboardTeacher className="mr-2 text-purple-600 dark:text-purple-400" />
                  <span>{language === 'si' ? 'පරිපාලක ලොගින්' : 'Admin Login'}</span>
                </>
              )}
            </h2>
            
            {(error || localError) && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error || localError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                  {userType === 'student'
                    ? (language === 'si' ? 'ශිෂ්‍ය ID හෝ විද්‍යුත් තැපෑල' : 'Student ID or Email')
                    : (language === 'si' ? 'විද්‍යුත් තැපෑල' : 'Email')}
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={userType === 'student'
                    ? (language === 'si' ? 'ඔබගේ ශිෂ්‍ය ID හෝ විද්‍යුත් තැපෑල' : 'Your Student ID or Email')
                    : (language === 'si' ? 'ඔබගේ විද්‍යුත් තැපෑල' : 'Your Email')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
                  {language === 'si' ? 'මුරපදය' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder={language === 'si' ? 'ඔබගේ මුරපදය' : 'Your password'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md transition ${
                  userType === 'student'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } disabled:opacity-50`}
              >
                {isLoading 
                  ? (language === 'si' ? 'පිවිසෙමින්...' : 'Signing in...') 
                  : (language === 'si' ? 'පිවිසෙන්න' : 'Sign in')}
              </button>
            </form>
            
            {userType === 'student' && (
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => handleForgotCredentials('id')}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm bg-transparent"
                >
                  {language === 'si' ? 'ශිෂ්‍ය ID අමතකද?' : 'Forgot Student ID?'}
                </button>
              </div>
            )}
            
            {userType === 'admin' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => handleForgotCredentials('password')}
                  className="text-purple-600 dark:text-purple-400 hover:underline text-sm bg-transparent"
                >
                  {language === 'si' ? 'මුරපදය අමතකද?' : 'Forgot password?'}
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {language === 'si' 
                ? 'තාක්ෂණික සහය සඳහා, කරුණාකර අපව අමතන්න' 
                : 'For technical support, please contact us'}
            </p>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Sathipasala. {language === 'si' ? 'සියලුම හිමිකම් ඇවිරිණි.' : 'All rights reserved.'}
      </footer>
    </div>
  );
};

export default Login;