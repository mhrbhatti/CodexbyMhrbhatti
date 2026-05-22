import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTestPage = location.pathname.startsWith('/test/');

  return (
    <div className="layout">
      {!isTestPage && (
        <header className="navbar">
          <div className="container navbar-inner">
            <NavLink to="/dashboard" className="navbar-logo">
              <div className="logo-icon">CM</div>
              <span className="logo-text">Codex<span className="logo-accent">Mhrbhatti</span></span>
            </NavLink>

            <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/new-test" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                New Test
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                History
              </NavLink>
            </nav>

            <div className="navbar-right">
              <div className="user-pill">
                <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  {user?.enrolledClass && <span className="user-class">Class {user.enrolledClass}</span>}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
                Logout
              </button>
              <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                <span /><span /><span />
              </button>
            </div>
          </div>
        </header>
      )}
      <main className={`main-content ${isTestPage ? 'fullscreen' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
