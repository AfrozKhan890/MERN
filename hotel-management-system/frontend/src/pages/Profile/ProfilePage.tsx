// frontend/src/pages/Profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaSave, FaHotel } from 'react-icons/fa';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [hotelForm, setHotelForm] = useState({
    hotelName: 'LuxuryStay Hospitality',
    phone: '(555) 123-4567',
    email: 'info@luxurystay.com',
    address: '123 Hotel Street, City, Country'
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put('/auth/updateprofile', profileForm);
      if (data.success) {
        const updatedUser = { ...user, ...profileForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.put('/auth/changepassword', passwordForm);
      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelUpdate = (e) => {
    e.preventDefault();
    toast.success('Hotel information updated!');
  };

  const tabs = [
    { key: 'personal', icon: <FaUser />, label: 'Personal Info' },
    { key: 'password', icon: <FaLock />, label: 'Password' },
  ];

  if (user?.role === 'admin') {
    tabs.push({ key: 'hotel', icon: <FaHotel />, label: 'Hotel Details' });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p className="breadcrumb-text">Manage your account settings</p>
        </div>
      </div>

      <Row>
        <Col md={3}>
          <Card className="modern-card profile-sidebar">
            <Card.Body className="text-center p-4">
              <div className="profile-avatar-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <h5 className="mt-3 mb-1">{user?.name}</h5>
              <p className="text-muted">{user?.role?.toUpperCase()}</p>
              <p className="text-muted small mb-0">{user?.email}</p>
            </Card.Body>
            <div className="profile-tabs">
              {tabs.map(tab => (
                <div
                  key={tab.key}
                  className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="me-2">{tab.icon}</span> {tab.label}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col md={9}>
          <Card className="modern-card">
            <Card.Body className="p-4">
              {activeTab === 'personal' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="mb-4">Personal Information</h5>
                  <Form onSubmit={handleProfileUpdate} className="form-modern">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileForm.department}
                            onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={loading} className="btn-modern btn-modern-primary">
                      <FaSave className="me-2" /> {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Form>
                </motion.div>
              )}

              {activeTab === 'password' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="mb-4">Change Password</h5>
                  <Form onSubmit={handlePasswordChange} className="form-modern">
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            required
                            minLength={6}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={loading} className="btn-modern btn-modern-primary">
                      <FaLock className="me-2" /> Update Password
                    </Button>
                  </Form>
                </motion.div>
              )}

              {activeTab === 'hotel' && user?.role === 'admin' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="mb-4">Hotel Information</h5>
                  <Form onSubmit={handleHotelUpdate} className="form-modern">
                    <Form.Group className="mb-3">
                      <Form.Label>Hotel Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={hotelForm.hotelName}
                        onChange={(e) => setHotelForm({...hotelForm, hotelName: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="text"
                            value={hotelForm.phone}
                            onChange={(e) => setHotelForm({...hotelForm, phone: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={hotelForm.email}
                            onChange={(e) => setHotelForm({...hotelForm, email: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={hotelForm.address}
                        onChange={(e) => setHotelForm({...hotelForm, address: e.target.value})}
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="btn-modern btn-modern-primary">
                      <FaHotel className="me-2" /> Update Hotel Info
                    </Button>
                  </Form>
                </motion.div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default ProfilePage;