import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BNavbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaSignOutAlt, FaSun, FaMoon, FaHotel, FaChartLine, FaCog } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { darkMode, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.token) {
      fetchUnreadCount();
      fetchNotifications();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count || 0);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications?limit=5');
      setNotifications(data.data || []);
    } catch (error) {
      setNotifications([]);
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('user');
  //   navigate('/login');
  // };

  // In Navbar.jsx, change handleLogout:
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';  // Full reload to landing page
  };

  if (!user) return null;

  const getDashboardLink = () => {
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'manager') return '/dashboard/manager';
    return '/dashboard/staff';
  };

  return (
    <BNavbar className="navbar-custom" fixed="top">
      <Container fluid>
        <BNavbar.Brand>
          <Link to={getDashboardLink()} className="navbar-brand-link">
            <FaHotel /> LuxuryStay
          </Link>
        </BNavbar.Brand>

        <div className="navbar-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
          >
            {darkMode ? '🌞' : '🌙'}
          </button>

          {/* Notifications Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="nav-icon">
              <FaBell />
              {unreadCount > 0 && (
                <Badge bg="danger" pill className="notification-badge">{unreadCount}</Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="notification-dropdown">
              <Dropdown.Header>Notifications</Dropdown.Header>
              {notifications.length > 0 ? notifications.map(notif => (
                <Dropdown.Item key={notif._id}>
                  <strong>{notif.title}</strong>
                  <p className="mb-0 small">{notif.message}</p>
                  <small className="text-muted">{new Date(notif.createdAt).toLocaleString()}</small>
                </Dropdown.Item>
              )) : (
                <Dropdown.Item disabled>No notifications</Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>

          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="user-dropdown">
              <FaUserCircle className="me-1" /> {user.name || 'User'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>
                <strong>{user.name}</strong><br />
                <small>{user.email}</small>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => navigate('/profile')}>
                <FaUserCircle className="me-2" /> Profile
              </Dropdown.Item>
              {user.role === 'admin' && (
                <Dropdown.Item onClick={() => navigate('/settings')}>
                  <FaCog className="me-2" /> Settings
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <FaSignOutAlt className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </BNavbar>
  );
};

export default Navbar;