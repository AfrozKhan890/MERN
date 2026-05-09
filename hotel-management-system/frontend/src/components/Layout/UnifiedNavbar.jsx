import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BNavbar, Nav, Container, Dropdown, Badge, Button, NavbarToggle, NavbarCollapse } from 'react-bootstrap';
import { 
  FaBell, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaSun, 
  FaMoon, 
  FaHotel, 
  FaChartLine, 
  FaCog,
  FaBars,
  FaTimes,
  FaImage
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import './UnifiedNavbar.css';

const UnifiedNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const { darkMode, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count || 0);
    } catch (error) {
      setUnreadCount(0);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications?limit=5');
      setNotifications(data.data || []);
    } catch (error) {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (user?.token && user.role !== 'guest' && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchUnreadCount();
      fetchNotifications();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, fetchNotifications]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'guest') return '/gallery';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'manager') return '/dashboard/manager';
    return '/dashboard/staff';
  };

  const handleNavClick = (path) => {
    navigate(path);
    setExpanded(false);
  };

  const isLandingPage = location.pathname === '/';
  const isGalleryPage = location.pathname === '/gallery';

  return (
    <BNavbar 
      className={`unified-navbar ${scrolled ? 'scrolled' : ''} ${isLandingPage ? 'landing-nav' : ''}`}
      fixed="top"
      expand="lg"
    >
      <Container fluid>
        <BNavbar.Brand>
          <Link to={getDashboardLink()} className="navbar-brand-link">
            <FaHotel /> LuxuryStay
          </Link>
        </BNavbar.Brand>

        <NavbarToggle 
          aria-controls="navbar-nav" 
          className="border-0 shadow-none"
          onClick={() => setExpanded(exp => !exp)}
        >
          {expanded ? <FaTimes color="var(--text-primary)" /> : <FaBars color="var(--text-primary)" />}
        </NavbarToggle>

        <NavbarCollapse id="navbar-nav" in={expanded}>
          {/* Navigation Links */}
          <Nav className="me-auto">
            {!user || isLandingPage ? (
              <>
                <Nav.Link href="#features" className="nav-link-custom">Features</Nav.Link>
                <Nav.Link href="#about" className="nav-link-custom">About</Nav.Link>
                <Nav.Link href="#testimonials" className="nav-link-custom">Reviews</Nav.Link>
                <Nav.Link href="#contact" className="nav-link-custom">Contact</Nav.Link>
              </>
            ) : user.role === 'guest' ? (
              <>
                <Nav.Link 
                  onClick={() => handleNavClick('/gallery')} 
                  className={`nav-link-custom ${isGalleryPage ? 'active' : ''}`}
                >
                  Gallery
                </Nav.Link>
              </>
            ) : null}
          </Nav>

          {/* Right Side Actions */}
          <div className="navbar-actions">
            {/* Theme Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {user ? (
              <>
                {/* Notifications for Staff/Admin */}
                {user.role !== 'guest' && (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="nav-icon">
                      <FaBell />
                      {unreadCount > 0 && (
                        <Badge bg="danger" pill className="notification-badge">
                          {unreadCount}
                        </Badge>
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="notification-dropdown">
                      <Dropdown.Header>Notifications</Dropdown.Header>
                      {notifications.length > 0 ? notifications.map(notif => (
                        <Dropdown.Item key={notif._id}>
                          <strong>{notif.title}</strong>
                          <p className="mb-0 small">{notif.message}</p>
                          <small className="text-muted">
                            {new Date(notif.createdAt).toLocaleString()}
                          </small>
                        </Dropdown.Item>
                      )) : (
                        <Dropdown.Item disabled>No notifications</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}

                {/* Gallery Button for Guests */}
                {user.role === 'guest' && (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate('/gallery')}
                    className="me-2"
                  >
                    <FaImage className="me-1" /> Gallery
                  </Button>
                )}

                {/* User Dropdown */}
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" className="user-dropdown">
                    <FaUserCircle className="me-1" /> {user.name?.split(' ')[0] || 'User'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>
                      <strong>{user.name}</strong><br />
                      <small>{user.email}</small>
                      <br />
                      <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'manager' ? 'primary' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => navigate('/profile')}>
                      <FaUserCircle className="me-2" /> Profile
                    </Dropdown.Item>
                    {user.role !== 'guest' && user.role === 'admin' && (
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
              </>
            ) : (
              /* Not Logged In */
              <Button 
                variant="primary" 
                onClick={() => navigate('/login')}
                className="get-started-btn"
              >
                Get Started
              </Button>
            )}
          </div>
        </NavbarCollapse>
      </Container>
    </BNavbar>
  );
};

export default UnifiedNavbar;
