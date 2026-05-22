import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Redirect to login if no user
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container-fluid vh-100 p-0 d-flex bg-light text-dark overflow-hidden">
      <Sidebar user={user} darkMode={darkMode} toggleTheme={toggleTheme} onLogout={handleLogout} />
      <div className="flex-grow-1 p-4 p-md-5 overflow-auto bg-white">
        {children}
      </div>
    </div>
  );
};

export default Layout;