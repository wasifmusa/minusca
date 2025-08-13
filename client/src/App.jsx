import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersPage from './pages/ManageUsersPage';
import CategoryPage from './pages/CategoryPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-view">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
