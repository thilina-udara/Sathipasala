import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import StudentRegistration from './pages/admin/StudentRegistration';
import Students from './pages/admin/Students';
import StudentDetails from './pages/admin/StudentDetails';
import EditStudent from './pages/admin/EditStudent';
import StudentAttendance from './pages/admin/StudentAttendance';
import Attendance from './pages/admin/Attendance';
import AttendanceAnalysis from './pages/admin/AttendanceAnalysis';
import './i18n';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
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
              
              {/* Attendance Routes */}
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/attendance/analysis" element={<AttendanceAnalysis />} />
            </Route>
          </Route>
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
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