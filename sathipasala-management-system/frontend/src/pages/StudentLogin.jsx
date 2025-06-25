import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaHome, FaKey, FaUserGraduate, FaQuestionCircle } from 'react-icons/fa';
import { IoLanguage } from 'react-icons/io5';
import logo from '../components/image/logo/logo.png'; // Import your logo


const StudentLogin = () => {
  const { i18n } = useTranslation();
  const { login, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
      const user = await login(formData.studentId, formData.password);
      
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        setLocalError('This page is for students only. Please ask your teacher for help.');
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Oops! Please check your Student ID and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert(language === 'si' 
      ? 'කරුණාකර ඔබගේ ගුරුවරයා හමුවන්න!' 
      : 'Please see your teacher for password reset!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 flex flex-col relative">
      
      {/* Header */}
      <div className="w-full p-4 flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors"
        >
          <FaHome className="mr-2" />
          {language === 'si' ? 'මුල් පිටුවට' : 'Back to Home'}
        </Link>
        
        {/* Language Toggle */}
        <div className="flex bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
          <button
            onClick={() => switchLanguage('en')}
            className={`px-3 py-1 text-sm ${language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            English
          </button>
          <button
            onClick={() => switchLanguage('si')}
            className={`px-3 py-1 text-sm ${language === 'si' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            සිංහල
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Updated Logo and Title Section */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex justify-center">
              {/* Logo Container with Mindful Styling */}
              <div className="p-2 bg-white rounded-full shadow-lg border-4 border-blue-200 dark:border-blue-700">
                <img 
                  src={logo} 
                  alt="School Logo" 
                  className="w-28 h-28 object-contain" // Adjust size as needed
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
              {language === 'si' ? 'බවුන්සෙත් සති පාසල' : 'BAUNSETH SATHIPASALA'}
            </h1>
            <p className="text-blue-600 dark:text-blue-200">
              {language === 'si' ? 'ශිෂ්‍ය ලොගින්' : 'Student Login'}
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
            
            {/* Error Display */}
            {(error || localError) && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error || localError}
              </div>
            )}
            
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Student ID Field */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'si' ? 'ශිෂ්‍ය හැඳුනුම්පත' : 'Student ID'}
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  placeholder="BSP_25_4582"
                  className="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Password Field */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'si' ? 'මුරපදය' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder={language === 'si' ? 'මුරපදය ඇතුළත් කරන්න' : 'Enter your password'}
                    className="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span>{language === 'si' ? 'පිවිසෙමින්...' : 'Logging in...'}</span>
                ) : (
                  <span>{language === 'si' ? 'ඇතුල් වන්න' : 'Login'}</span>
                )}
              </button>
            </form>
            
            {/* Forgot Password */}
            <div className="mt-4 text-center">
              <button
                onClick={handleForgotPassword}
                className="text-blue-600 dark:text-blue-300 hover:underline flex items-center justify-center text-sm"
              >
                <FaKey className="mr-1" size={14} />
                {language === 'si' ? 'මුරපදය අමතකද?' : 'Forgot Password?'}
              </button>
            </div>
            
            {/* Help Section */}
            <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <FaQuestionCircle className="mr-1" size={14} />
                {language === 'si' ? 'උදව් අවශ්‍යද? ගුරුවරයාගෙන් අහන්න!' : 'Need help? Ask your teacher!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-blue-600 dark:text-blue-300 text-sm">
        © {new Date().getFullYear()} BAUNSETH SATHIPASALA
      </div>
    </div>
  );
};
export default StudentLogin;