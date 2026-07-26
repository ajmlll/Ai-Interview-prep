import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MockInterview from './pages/MockInterview';
import Resume from './pages/Resume';
import JdAnalyzer from './pages/JdAnalyzer';
import CoverLetter from './pages/CoverLetter';
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
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-logo">
          <Link to="/">
            <div className="brand-logo-badge">
              <span>⚡</span>
            </div>
            <span className="brand-name">AI Interview Prep</span>
          </Link>
        </div>
        <nav className="app-sidebar-nav">
          <Link to="/" className={isActive('/')}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </Link>
          <Link to="/mock-interview" className={isActive('/mock-interview')}>
            <span className="nav-icon">🎙️</span>
            <span className="nav-label">Mock Interview</span>
          </Link>
          <Link to="/resume" className={isActive('/resume')}>
            <span className="nav-icon">📄</span>
            <span className="nav-label">Resume Studio & Audit</span>
          </Link>
          <Link to="/jd-analyzer" className={isActive('/jd-analyzer')}>
            <span className="nav-icon">🎯</span>
            <span className="nav-label">JD Match & ATS</span>
          </Link>
          <Link to="/cover-letter" className={isActive('/cover-letter')}>
            <span className="nav-icon">✉️</span>
            <span className="nav-label">Cover Letter & Outreach</span>
          </Link>
          <Link to="/progress" className={isActive('/progress')}>
            <span className="nav-icon">📈</span>
            <span className="nav-label">Performance & Analytics</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin')}>
              <span className="nav-icon">🛠️</span>
              <span className="nav-label">Admin Dashboard</span>
            </Link>
          )}
        </nav>
      </aside>
      
      <div className="app-body">
        <header className="app-topbar">
          {user && (
            <div className="app-user-profile-pill">
              <div className="avatar-ring">
                <span className="avatar-initial">{userInitial}</span>
              </div>
              <div className="app-user-meta">
                <span className="app-user-name">{user.name}</span>
                <span className="app-user-role-badge">
                  <span className="role-dot"></span>
                  {user.role}
                </span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout" title="Sign out of account">
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </header>
        
        <main className="app-main">
          {children}
        </main>
        
        <footer className="app-footer">
          <p>&copy; 2026 AI Interview Preparation Platform. All rights reserved.</p>
        </footer>
      </div>
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
      <Route path="/jd-analyzer" element={<RequireAuth><Layout><JdAnalyzer /></Layout></RequireAuth>} />
      <Route path="/cover-letter" element={<RequireAuth><Layout><CoverLetter /></Layout></RequireAuth>} />
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
