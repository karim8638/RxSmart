import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Admin/AdminLayout';
import AdminRoute from './components/Admin/AdminRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import MobileDashboard from './components/Dashboard/MobileDashboard';
import MedicineList from './components/Medicines/MedicineList';
import ReportsAnalytics from './components/Reports/ReportsAnalytics';
import CustomReportBuilder from './components/Reports/CustomReportBuilder';
import EmailReports from './components/Reports/EmailReports';
import SubscriptionRequest from './components/Subscriptions/SubscriptionRequest';
import SubscriptionManagement from './components/Subscriptions/SubscriptionManagement';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return appUser?.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
};

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const AppRoutes: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subscription-request" element={
          <ProtectedRoute>
            <SubscriptionRequest />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRouteWrapper>
              <AdminLayout />
            </AdminRouteWrapper>
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="inventory" element={<div className="p-8 text-center">Inventory management coming soon...</div>} />
          <Route path="analytics" element={<ReportsAnalytics />} />
          <Route path="payments" element={<div className="p-8 text-center">Payment management coming soon...</div>} />
          <Route path="settings" element={<div className="p-8 text-center">Admin settings coming soon...</div>} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Regular User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            {isMobile ? <MobileDashboard /> : <Layout />}
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="medicines" element={<MedicineList />} />
          <Route path="purchases" element={<div className="p-8 text-center">Purchases module coming soon...</div>} />
          <Route path="sales" element={<div className="p-8 text-center">Sales module coming soon...</div>} />
          <Route path="payments" element={<div className="p-8 text-center">Payments module coming soon...</div>} />
          <Route path="expenses" element={<div className="p-8 text-center">Expenses module coming soon...</div>} />
          <Route path="patients" element={<div className="p-8 text-center">Patients module coming soon...</div>} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="reports/builder" element={<CustomReportBuilder />} />
          <Route path="reports/email" element={<EmailReports />} />
          <Route path="subscriptions" element={
            <AdminRouteWrapper>
              <SubscriptionManagement />
            </AdminRouteWrapper>
          } />
          <Route path="settings/*" element={<div className="p-8 text-center">Settings module coming soon...</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;