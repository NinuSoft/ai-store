import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { RotateCw } from 'lucide-react';

// Protected Route Guard (redirects to /?login=true if unauthenticated)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', color: 'var(--text-muted)' }}>
        <RotateCw size={36} className="animate-float" style={{ animationDuration: '2s', color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/?login=true" replace />;
  }

  return <>{children}</>;
};

// Admin Route Guard (for Admin Dashboard)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', color: 'var(--text-muted)' }}>
        <RotateCw size={36} className="animate-float" style={{ animationDuration: '2s', color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/?login=true" replace />;
  }

  if (profile && !profile.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          
          {/* Wildcard Catchall redirects back to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
