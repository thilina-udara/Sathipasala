import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
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
      // Use email field for admin login
      const user = await login(formData.email, formData.password);
      
      // Only allow admin/teacher login on this page
      if (user.role === 'admin' || user.role === 'teacher') {
        navigate('/admin/dashboard');
      } else {
        setLocalError('Access denied. Administrator credentials required.');
        // Auto logout if not admin
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/bsp/login/admin');
        }, 2000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center">
      
      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => switchLanguage('en')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => switchLanguage('si')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              language === 'si'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            සිං
          </button>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="w-full max-w-md px-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg mb-4">
            <span className="text-2xl text-white font-bold">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {language === 'si' ? 'පරිපාලක ප්‍රවේශය' : 'Administrator Access'}
          </h1>
          <p className="text-gray-400 text-sm">
            {language === 'si' ? 'බවුන්සෙත් සති පාසල පරිපාලන පද්ධතිය' : 'BAUNSETH SATHIPASALA Management System'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
          
          {/* Security Notice */}
          <div className="mb-6 p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
            <p className="text-amber-200 text-xs text-center">
              <span className="font-medium">🛡️ {language === 'si' ? 'ආරක්ෂිත ප්‍රවේශය' : 'SECURE ACCESS'}</span>
              <br />
              {language === 'si' 
                ? 'අනවසර ප්‍රවේශය නීතිමය ක්‍රියාමාර්ගයට තුඩු දේ' 
                : 'Unauthorized access is subject to legal action'}
            </p>
          </div>
          
          {/* Error Display */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error || localError}
              </div>
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'si' ? 'විද්‍යුත් තැපෑල' : 'Email Address'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder={language === 'si' ? 'ඔබගේ විද්‍යුත් තැපෑල' : 'Enter your email'}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
              />
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'si' ? 'මුරපදය' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder={language === 'si' ? 'ඔබගේ මුරපදය' : 'Enter your password'}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-colors pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (language === 'si' ? 'පිරික්සමින්...' : 'Authenticating...') 
                : (language === 'si' ? 'පිවිසෙන්න' : 'Sign In')}
            </button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs">
              {language === 'si' 
                ? 'ගැටලු සඳහා පද්ධති පරිපාලකයා අමතන්න' 
                : 'Contact system administrator for support'}
            </p>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} BAUNSETH SATHIPASALA. {language === 'si' ? 'සියලුම හිමිකම් ඇවිරිණි.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;