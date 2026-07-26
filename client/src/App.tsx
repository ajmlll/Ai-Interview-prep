import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MockInterview from './pages/MockInterview';
import Resume from './pages/Resume';
import AdminDashboard from './pages/AdminDashboard';
import Progress from './pages/Progress';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import './App.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo-container">
          <Link to="/" className="brand-logo">AI Interview Prep</Link>
        </div>
        <nav className="nav-menu">
          <Link to="/">Dashboard</Link>
          <Link to="/resume">Resume</Link>
          <Link to="/progress">Progress</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
            {user ? (
              <>
                <span style={{ fontSize: '0.9rem', color: '#555555' }}>
                  Hello, <strong>{user.name}</strong>
                </span>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-sm"
                  style={{ border: '1px solid #cbd5e1' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-login-nav">Login</Link>
            )}
          </div>
        </nav>
      </header>
      <main className="app-content">
        {children}
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 AI Interview Preparation Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

function AppContent() {
  return (
    <Routes>
      {/* Auth routes without Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App routes with Layout */}
      <Route path="/" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
      <Route path="/mock-interview" element={<RequireAuth><Layout><MockInterview /></Layout></RequireAuth>} />
      <Route path="/resume" element={<RequireAuth><Layout><Resume /></Layout></RequireAuth>} />
      <Route path="/progress" element={<RequireAuth><Layout><Progress /></Layout></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><Layout><AdminDashboard /></Layout></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
