import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import AdminLogin from './pages/AdminLogin'; // NEW: Secure admin login
import StudentLogin from './pages/StudentLogin'; // NEW: Child-friendly student login
import HomePage from './pages/HomePage'; 
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import StudentRegistration from './pages/admin/StudentRegistration';
import Students from './pages/admin/Students';
import StudentDetails from './pages/admin/StudentDetails';
import EditStudent from './pages/admin/EditStudent';
import StudentAttendance from './pages/admin/StudentAttendance';
import Attendance from './pages/admin/Attendance';
import AttendanceAnalysis from './pages/admin/AttendanceAnalysis';
import BreathingBuddies from './pages/games/BreathingBuddies';
import MindfulListening from './pages/games/MindfulListening';
import KindnessGarden from './pages/games/KindnessGarden';
import FivePrecepts from './pages/games/FivePrecepts';
import SacredGrove from './pages/games/SacredGrove';
import ClassGroups from './pages/admin/ClassGroups';
import GalleryManager from './pages/admin/gallery/GalleryManager';
import GalleryPage from './pages/GalleryPage';
import HomeSwiperAdmin from './pages/admin/HomeSwiperAdmin';
import LearnSubjectPage from './pages/learn/LearnSubjectPage';
import EnglishLevel from './pages/learn/EnglishLevel';
import './i18n';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* SECURE ADMIN ROUTE - Hidden from general users */}
          <Route path="/bsp/login/admin" element={<AdminLogin />} />
          
          {/* Student login route - public and friendly */}
          <Route path="/student-login" element={<StudentLogin />} />
          
          {/* Games routes */}
          <Route path="/games/breathing-buddies" element={<BreathingBuddies />} />
          <Route path="/games/mindful-listening" element={<MindfulListening />} />
          <Route path="/games/kindness-garden" element={<KindnessGarden />} />
          <Route path="/games/five-precepts" element={<FivePrecepts />} />
          <Route path="/games/sacred-grove" element={<SacredGrove />} />
          
          {/* Protected routes for Admin with Layout */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              {/* Dashboard */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Student Management Routes */}
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/students/register" element={<StudentRegistration />} />
              <Route path="/admin/students/:id" element={<StudentDetails />} />
              <Route path="/admin/students/:id/edit" element={<EditStudent />} />
              <Route path="/admin/students/:id/attendance" element={<StudentAttendance />} />
              <Route path="/admin/students/classes" element={<ClassGroups />} />
              
              {/* Class Management Routes */}
              <Route path="/admin/classes" element={<ClassGroups />} />
              
              {/* Attendance Routes */}
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/attendance/analysis" element={<AttendanceAnalysis />} />
              <Route path="/admin/gallery" element={<GalleryManager />} />
              <Route path="/admin/home-swiper" element={<HomeSwiperAdmin />} />
            </Route>
          </Route>
          
          {/* Protected routes for Students */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<div className="p-8 text-center bg-gradient-to-br from-pink-100 to-purple-100 min-h-screen">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                🎓 Student Dashboard
              </h1>
              <p className="text-lg text-purple-700">
                🌟 Welcome to your magical learning portal! 🌟
              </p>
              <p className="text-gray-600 mt-2">
                Your dashboard will be ready soon!
              </p>
            </div>} />
          </Route>
          
          {/* Subject Learning Page - Publicly accessible subject learning */}
          <Route path="/learn/:subjectId" element={<LearnSubjectPage />} />
          <Route path="/learn/english/:levelId" element={<EnglishLevel />} />
          
          {/* Gallery Page - Publicly accessible gallery */}
          <Route path="/baunseth_sathi_pasala/gallery" element={<GalleryPage />} />
          
          {/* 404 Page - Catch all unmatched routes */}
          <Route path="*" element={
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">404</h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">Page not found</p>
                <a 
                  href="/" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Back to Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;