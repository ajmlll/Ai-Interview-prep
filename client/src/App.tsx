import React, { useState } from 'react';
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
import {
  DashboardIcon,
  MockInterviewIcon,
  ResumeIcon,
  JdMatchIcon,
  CoverLetterIcon,
  AnalyticsIcon,
  AdminIcon,
  ZapIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon
} from './components/Icons';
import './App.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="app-shell">
      {/* Mobile Nav Backdrop Overlay */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={closeMobileNav} />
      )}

      <aside className={`app-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="app-sidebar-logo">
          <Link to="/" onClick={closeMobileNav}>
            <div className="brand-logo-badge">
              <ZapIcon size={20} color="#ffffff" />
            </div>
            <span className="brand-name">AI Interview Prep</span>
          </Link>

          <button className="mobile-close-btn" onClick={closeMobileNav} aria-label="Close Navigation">
            <CloseIcon size={20} color="#64748b" />
          </button>
        </div>

        <nav className="app-sidebar-nav">
          <Link to="/" className={isActive('/')} onClick={closeMobileNav}>
            <span className="nav-icon-badge nav-icon-blue">
              <DashboardIcon size={18} />
            </span>
            <span className="nav-label">Dashboard</span>
          </Link>

          <Link to="/mock-interview" className={isActive('/mock-interview')} onClick={closeMobileNav}>
            <span className="nav-icon-badge nav-icon-indigo">
              <MockInterviewIcon size={18} />
            </span>
            <span className="nav-label">Mock Interview</span>
          </Link>

          <Link to="/resume" className={isActive('/resume')} onClick={closeMobileNav}>
            <span className="nav-icon-badge nav-icon-teal">
              <ResumeIcon size={18} />
            </span>
            <span className="nav-label">Resume Studio & Audit</span>
          </Link>

          <Link to="/jd-analyzer" className={isActive('/jd-analyzer')} onClick={closeMobileNav}>
            <span className="nav-icon-badge nav-icon-rose">
              <JdMatchIcon size={18} />
            </span>
            <span className="nav-label">JD Match & ATS</span>
          </Link>

          <Link to="/cover-letter" className={isActive('/cover-letter')} onClick={closeMobileNav}>
            <span className="nav-icon-badge nav-icon-violet">
              <CoverLetterIcon size={18} />
            </span>
            <span className="nav-label">Cover Letter & Outreach</span>
          </Link>

          <Link to="/progress" className={isActive('/progress')} onClick={closeMobileNav}>
            <span className="nav-icon-badge nav-icon-cyan">
              <AnalyticsIcon size={18} />
            </span>
            <span className="nav-label">Performance & Analytics</span>
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin')} onClick={closeMobileNav}>
              <span className="nav-icon-badge nav-icon-slate">
                <AdminIcon size={18} />
              </span>
              <span className="nav-label">Admin Dashboard</span>
            </Link>
          )}
        </nav>
      </aside>
      
      <div className="app-body">
        <header className="app-topbar">
          <button className="mobile-menu-toggle" onClick={() => setMobileNavOpen(true)} aria-label="Toggle Navigation">
            <MenuIcon size={24} color="#0f172a" />
          </button>

          <div className="topbar-right">
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
              <LogoutIcon size={16} color="#ffffff" />
              <span>Logout</span>
            </button>
          </div>
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
