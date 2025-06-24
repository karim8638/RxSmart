import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import MedicineList from './components/Medicines/MedicineList';

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

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="medicines" element={<MedicineList />} />
          <Route path="purchases" element={<div className="p-8 text-center">Purchases module coming soon...</div>} />
          <Route path="sales" element={<div className="p-8 text-center">Sales module coming soon...</div>} />
          <Route path="payments" element={<div className="p-8 text-center">Payments module coming soon...</div>} />
          <Route path="expenses" element={<div className="p-8 text-center">Expenses module coming soon...</div>} />
          <Route path="patients" element={<div className="p-8 text-center">Patients module coming soon...</div>} />
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