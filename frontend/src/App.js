import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SelectChapterPage from './pages/SelectChapterPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Redirects /new-test to the user's own class chapter page
const NewTestRedirect = () => {
  const { user } = useAuth();
  if (!user?.enrolledClass) return <Navigate to="/dashboard" replace />;
  return <Navigate to={`/select-chapter/${user.enrolledClass}`} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="new-test" element={<NewTestRedirect />} />
            {/* select-class removed — students locked to own class */}
            <Route path="select-chapter/:classNo" element={<SelectChapterPage />} />
            <Route path="test/:classNo/:chapterNo" element={<TestPage />} />
            <Route path="result" element={<ResultPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
