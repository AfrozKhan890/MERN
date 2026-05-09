
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar as BNavbar, Container, Button } from 'react-bootstrap';
import { FaHotel, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './GuestNavbar.css';

const GuestNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Force full page reload to landing page instead of navigate
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <BNavbar className="guest-navbar" fixed="top">
      <Container fluid>
        <BNavbar.Brand>
          <span className="guest-brand-link" onClick={() => navigate('/gallery')} style={{ cursor: 'pointer' }}>
            <FaHotel /> LuxuryStay
          </span>
        </BNavbar.Brand>

        <div className="guest-nav-actions">
          <span className="guest-welcome">Welcome, {user.name?.split(' ')[0]}</span>
          <Button variant="outline-light" size="sm" onClick={() => navigate('/profile')} className="me-2">
            <FaUserCircle className="me-1" /> Profile
          </Button>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <FaSignOutAlt className="me-1" /> Logout
          </Button>
        </div>
      </Container>
    </BNavbar>
  );
};

export default GuestNavbar;