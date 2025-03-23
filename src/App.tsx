import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/theme';
import { Toaster } from 'react-hot-toast';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import JobApplication from './pages/JobApplication';
import EmployeeApplications from './pages/EmployeeApplications';
import EmployerApplications from './pages/EmployerApplications';

function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className={`min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text`}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes */}
          <Route element={<DashboardLayout />}>
            {/* Employer routes */}
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employer/applications" element={<EmployerApplications />} />

            {/* Employee routes */}
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/jobs/:id/apply" element={<JobApplication />} />
            <Route path="/employee/applications" element={<EmployeeApplications />} />
          </Route>

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;