// frontend/src/components/Layout/GuestNavbar.jsx - NEW FILE
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BNavbar, Container, Button } from 'react-bootstrap';
import { FaHotel, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './GuestNavbar.css';

const GuestNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <BNavbar className="guest-navbar" fixed="top">
      <Container fluid>
        <BNavbar.Brand>
          <Link to="/gallery" className="guest-brand-link">
            <FaHotel /> LuxuryStay
          </Link>
        </BNavbar.Brand>
        
        <div className="guest-nav-actions">
          <span className="guest-welcome">Welcome, {user.name?.split(' ')[0]}</span>
          <Button variant="outline-light" size="sm" onClick={() => navigate('/profile')} className="me-2">
            <FaUserCircle className="me-1" /> Profile
          </Button>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            <FaSignOutAlt className="me-1" /> Logout
          </Button>
        </div>
      </Container>
    </BNavbar>
  );
};

export default GuestNavbar;