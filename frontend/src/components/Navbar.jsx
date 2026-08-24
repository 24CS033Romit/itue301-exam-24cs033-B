import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { member, token, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={token ? "/classes" : "/"} className="brand-wrapper">
          <div className="brand-icon">⚡</div>
          <div className="navbar-brand-title">
            <span>FITZONE</span>
            <span className="navbar-brand-subtitle">GYM & FITNESS</span>
          </div>
        </Link>

        <nav className="nav-links">
          {!token && (
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Sign In
            </Link>
          )}

          <Link
            to="/classes"
            className={`nav-link ${location.pathname === '/classes' ? 'active' : ''}`}
          >
            Classes & Schedules
          </Link>

          <Link
            to="/my-bookings"
            className={`nav-link ${location.pathname === '/my-bookings' || location.pathname === '/bookings' ? 'active' : ''}`}
          >
            My Bookings
          </Link>

          {token && role === 'admin' && (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Admin Portal
            </Link>
          )}

          {token && member && (
            <div className="user-profile-pill">
              <div className="user-avatar-circle">
                {getInitials(member.name || member.email)}
              </div>
              <div className="user-meta">
                <span className="user-name-text">{member.name || member.email}</span>
                <span className={`role-badge ${role === 'admin' ? 'role-admin' : 'role-member'}`}>
                  {role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign out of account">
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
