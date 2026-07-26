import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MockInterview from './pages/MockInterview';
import Resume from './pages/Resume';
import AdminDashboard from './pages/AdminDashboard';
import Progress from './pages/Progress';
import './App.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
          <Link to="/admin">Admin</Link>
          <Link to="/login" className="btn-login-nav">Login</Link>
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App routes with Layout */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/mock-interview" element={<Layout><MockInterview /></Layout>} />
        <Route path="/resume" element={<Layout><Resume /></Layout>} />
        <Route path="/progress" element={<Layout><Progress /></Layout>} />
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
