import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortalLayout as DashboardLayout } from './design/PortalLayout';
import { SignIn as LoginPage } from './design/SignIn';
import { CampusOverview as StudentDashboard } from './design/CampusOverview';
import { BookResourcePage } from './pages/BookResourcePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { InChargeDashboard } from './pages/InChargeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SpaceAvailability as AvailabilityPage } from './design/SpaceAvailability';
import { NotificationsPage } from './pages/NotificationsPage';

const RoleBasedHome: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user.role === 'incharge') return <Navigate to="/incharge/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Role Redirect */}
          <Route path="/" element={<RoleBasedHome />} />

          {/* Authenticated Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            {/* Student / Society Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/book" element={<BookResourcePage />} />
            <Route path="/student/bookings" element={<MyBookingsPage />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />

            {/* Permission In-Charge Routes */}
            <Route
              path="/incharge/dashboard"
              element={<InChargeDashboard initialTab="Pending" />}
            />
            <Route
              path="/incharge/pending"
              element={<InChargeDashboard initialTab="Pending" />}
            />
            <Route
              path="/incharge/bookings"
              element={<InChargeDashboard initialTab="All" />}
            />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<AdminDashboard />} />
            <Route path="/admin/societies" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminDashboard />} />

            {/* Shared Availability Route */}
            <Route path="/availability" element={<AvailabilityPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
