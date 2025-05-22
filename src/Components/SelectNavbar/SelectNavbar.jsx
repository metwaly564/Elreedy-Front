import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import AdminNavbar from '../AdminNavbar/AdminNavbar';
import style from './SelectNavbar.module.css';

const SelectNavbar = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Pages where we want to hide ALL navbars
  const hiddenNavbarRoutes = [
    '/login', 
    '/signup', 
    '/register',
    '/ForgetPassword',
    '/PasswordReset',
    '/StaffLogin'
  ];

  // Function to check auth status
  const checkAuth = () => {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        setUserRole('guest');
        return;
      }

      const decoded = jwt_decode(token);
      setUserRole(decoded?.rule || 'guest');
    } catch (error) {
      console.error('Token error:', error);
      setUserRole('guest');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for custom event dispatched after successful login
    const handleLogin = () => {
      setLoading(true);
      checkAuth();
    };

    window.addEventListener('auth-change', handleLogin);
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('auth-change', handleLogin);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Don't show ANY navbar on these routes
  if (hiddenNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  if (loading) {
    return <h1>Loading</h1>;
  }

  switch (userRole) {
    case 'admin':
      return <AdminNavbar />;
    case 'customer':
      return <Navbar />;
    case 'guest':
      return <Navbar />;
    default:
      return <Navbar />;
  }
};

export default React.memo(SelectNavbar);