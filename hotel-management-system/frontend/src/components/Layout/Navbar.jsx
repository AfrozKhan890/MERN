// frontend/src/components/Layout/Navbar.jsx (REPLACE COMPLETELY)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BNavbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import API from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
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
      // Silently fail - notifications might not be available
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications?limit=5');
      setNotifications(data.data || []);
    } catch (error) {
      // Silently fail
      setNotifications([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <BNavbar bg="dark" variant="dark" className="navbar-custom" fixed="top">
      <Container fluid>
        <BNavbar.Brand>
          <Link to={`/dashboard/${user.role === 'admin' ? 'admin' : user.role === 'manager' ? 'manager' : 'staff'}`} className="navbar-brand-link">
            🏨 LuxuryStay
          </Link>
        </BNavbar.Brand>
        
        <BNavbar.Toggle />
        
        <BNavbar.Collapse className="justify-content-end">
          <Nav className="align-items-center">
            {/* Notifications Dropdown */}
            <Dropdown align="end" className="me-3">
              <Dropdown.Toggle variant="link" className="nav-icon">
                <FaBell />
                {unreadCount > 0 && (
                  <Badge bg="danger" pill className="notification-badge">{unreadCount}</Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="notification-dropdown" style={{ width: '350px' }}>
                <Dropdown.Header>Notifications</Dropdown.Header>
                {notifications.length > 0 ? notifications.map(notif => (
                  <Dropdown.Item key={notif._id}>
                    <div>
                      <strong>{notif.title}</strong>
                      <p className="mb-0 small">{notif.message}</p>
                      <small className="text-muted">{new Date(notif.createdAt).toLocaleString()}</small>
                    </div>
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
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  );
};

export default Navbar;