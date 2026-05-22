import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clafLogo from '../assets/claf.png';

const Sidebar = ({ user, darkMode, toggleTheme, onLogout = () => {} }) => {
  const location = useLocation();
  const theme = { primary: "#003366", secondary: "#002244", accent: "#c5a059", success: "#28a745" };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '?');

  return (
    <div className="claf-sidebar p-4 d-none d-md-flex shadow-lg text-white" style={{ background: 'linear-gradient(180deg, #003366 0%, #002244 100%)', width: '280px', display: 'flex', flexDirection: 'column' }}>
      <div className="d-flex align-items-center mb-5 gap-3">
        <img src={clafLogo} alt="Logo" style={{ width: '40px' }} />
        <h4 className="fw-bold m-0" style={{ color: theme.accent }}>
          CLAF System
        </h4>
      </div>
      <nav className="nav flex-column gap-2">
        <Link className={`nav-link-item ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">Dashboard</Link>
        <Link className={`nav-link-item ${isActive('/profile') ? 'active' : ''}`} to="/profile">My Profile</Link>
        {user?.role === 'admin' && (
          <>
            <hr className="my-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Link className={`nav-link-item ${isActive('/admin-panel') ? 'active' : ''}`} to="/admin-panel">Admin Panel</Link>
            <Link className={`nav-link-item ${isActive('/admin-panel?view=claims') ? 'active' : ''}`} to="/admin-panel?view=claims">Manage Claims</Link>
            <Link className={`nav-link-item ${isActive('/admin-panel?view=users') ? 'active' : ''}`} to="/admin-panel?view=users">User Management</Link>
          </>
        )}
      </nav>
      <div className="claf-sidebar-footer">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white" 
                 style={{ width: '40px', height: '40px', backgroundColor: theme.accent, fontSize: '16px' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="fw-bold m-0 small" style={{ color: theme.accent }}>{user?.name || 'Guest'}</p>
              <p className="m-0 text-white-50" style={{ fontSize: '11px' }}>{user?.role?.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="claf-theme-toggle" title="Toggle theme">
            {darkMode ? '☀' : '☽'}
          </button>
        </div>
        <button onClick={() => onLogout?.()} className="claf-logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
