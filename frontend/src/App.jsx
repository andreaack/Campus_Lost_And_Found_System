import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ItemDetail from './pages/ItemDetail';
import Profile from './pages/Profile';
import AdminSecurity from './pages/AdminSecurity';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const userData = localStorage.getItem('user');
  let user = null;
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    user = null;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/item-detail/:id" element={
          <ProtectedRoute>
            <Layout>
              <ItemDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin Routes with Layout */}
        <Route path="/admin-panel" element={
          <AdminRoute>
            <Layout>
              <AdminSecurity />
            </Layout>
          </AdminRoute>
        } />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;