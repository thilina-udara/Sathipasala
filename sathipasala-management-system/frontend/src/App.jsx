import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import StudentRegistration from './pages/admin/StudentRegistration';
import Students from './pages/admin/Students';
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
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/students/register" element={<StudentRegistration />} />
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/attendance/analysis" element={<AttendanceAnalysis />} />
              {/* Add more admin routes here */}
            </Route>
          </Route>
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;