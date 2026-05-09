// frontend/src/pages/Settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Nav } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaCog, FaDollarSign, FaBell, FaCalendarAlt } from 'react-icons/fa';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Settings.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    hotelName: 'LuxuryStay Hospitality',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    maxAdvanceDays: 365,
    minStayHours: 24,
  });

  const [taxSettings, setTaxSettings] = useState({
    taxRate: 15,
    serviceCharge: 5,
    includeTaxInPrice: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    notifyOnBooking: true,
    notifyOnCheckout: true,
    notifyOnMaintenance: true,
  });

  const [roomDefaults, setRoomDefaults] = useState({
    standardPrice: 100,
    deluxePrice: 200,
    suitePrice: 500,
    presidentialPrice: 1000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      if (data.success && data.data) {
        const s = data.data;
        if (s.hotelName) setGeneralSettings(prev => ({ ...prev, hotelName: s.hotelName }));
        if (s.bookingSettings) {
          setGeneralSettings(prev => ({
            ...prev,
            checkInTime: s.bookingSettings.checkInTime || '14:00',
            checkOutTime: s.bookingSettings.checkOutTime || '12:00',
            maxAdvanceDays: s.bookingSettings.maxAdvanceDays || 365,
            minStayHours: s.bookingSettings.minStayHours || 24,
          }));
        }
        if (s.taxSettings) setTaxSettings(s.taxSettings);
        if (s.notifications) setNotificationSettings(s.notifications);
        if (s.roomDefaults) setRoomDefaults(s.roomDefaults);
      }
    } catch (error) {
      console.log('Using default settings');
    }
  };

  const handleSave = async (section, data) => {
    setLoading(true);
    try {
      const payload = {};
      if (section === 'general') payload.bookingSettings = data;
      else if (section === 'tax') payload.taxSettings = data;
      else if (section === 'notifications') payload.notifications = data;
      else if (section === 'rooms') payload.roomDefaults = data;

      await API.put('/settings', payload);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'general', icon: <FaCalendarAlt />, label: 'General' },
    { key: 'rooms', icon: <FaCog />, label: 'Room Defaults' },
    { key: 'tax', icon: <FaDollarSign />, label: 'Tax & Charges' },
    { key: 'notifications', icon: <FaBell />, label: 'Notifications' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h2>System Settings</h2>
          <p className="breadcrumb-text">Configure your hotel management system</p>
        </div>
      </div>

      <Row>
        <Col md={3}>
          <Card className="modern-card">
            <div className="settings-tabs">
              {tabs.map(tab => (
                <div
                  key={tab.key}
                  className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
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
              {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="mb-4">General Settings</h5>
                  <Form className="form-modern">
                    <Form.Group className="mb-3">
                      <Form.Label>Hotel Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={generalSettings.hotelName}
                        onChange={(e) => setGeneralSettings({...generalSettings, hotelName: e.target.value})}
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Check-in Time</Form.Label>
                          <Form.Control
                            type="time"
                            value={generalSettings.checkInTime}
                            onChange={(e) => setGeneralSettings({...generalSettings, checkInTime: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Check-out Time</Form.Label>
                          <Form.Control
                            type="time"
                            value={generalSettings.checkOutTime}
                            onChange={(e) => setGeneralSettings({...generalSettings, checkOutTime: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      className="btn-modern btn-modern-primary"
                      onClick={() => handleSave('general', generalSettings)}
                      disabled={loading}
                    >
                      Save General Settings
                    </Button>
                  </Form>
                </motion.div>
              )}

              {activeTab === 'rooms' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="mb-4">Room Default Pricing</h5>
                  <Form className="form-modern">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Standard Room ($/night)</Form.Label>
                          <Form.Control
                            type="number"
                            value={roomDefaults.standardPrice}
                            onChange={(e) => setRoomDefaults({...roomDefaults, standardPrice: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Deluxe Room ($/night)</Form.Label>
                          <Form.Control
                            type="number"
                            value={roomDefaults.deluxePrice}
                            onChange={(e) => setRoomDefaults({...roomDefaults, deluxePrice: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Suite ($/night)</Form.Label>
                          <Form.Control
                            type="number"
                            value={roomDefaults.suitePrice}
                            onChange={(e) => setRoomDefaults({...roomDefaults, suitePrice: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Presidential ($/night)</Form.Label>
                          <Form.Control
                            type="number"
                            value={roomDefaults.presidentialPrice}
                            onChange={(e) => setRoomDefaults({...roomDefaults, presidentialPrice: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      className="btn-modern btn-modern-primary"
                      onClick={() => handleSave('rooms', roomDefaults)}
                      disabled={loading}
                    >
                      Save Room Defaults
                    </Button>
                  </Form>
                </motion.div>
              )}

              {activeTab === 'tax' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="mb-4">Tax & Charges</h5>
                  <Form className="form-modern">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tax Rate (%)</Form.Label>
                          <Form.Control
                            type="number"
                            value={taxSettings.taxRate}
                            onChange={(e) => setTaxSettings({...taxSettings, taxRate: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Service Charge (%)</Form.Label>
                          <Form.Control
                            type="number"
                            value={taxSettings.serviceCharge}
                            onChange={(e) => setTaxSettings({...taxSettings, serviceCharge: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Check
                      type="checkbox"
                      label="Include tax in displayed price"
                      checked={taxSettings.includeTaxInPrice}
                      onChange={(e) => setTaxSettings({...taxSettings, includeTaxInPrice: e.target.checked})}
                      className="mb-3"
                    />
                    <Button
                      className="btn-modern btn-modern-primary"
                      onClick={() => handleSave('tax', taxSettings)}
                      disabled={loading}
                    >
                      Save Tax Settings
                    </Button>
                  </Form>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h5 className="mb-4">Notification Preferences</h5>
                  <Form className="form-modern">
                    <Form.Check
                      type="switch"
                      label="Email Notifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                      className="mb-3"
                    />
                    <Form.Check
                      type="switch"
                      label="SMS Notifications"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                      className="mb-3"
                    />
                    <Form.Check
                      type="switch"
                      label="Notify on New Booking"
                      checked={notificationSettings.notifyOnBooking}
                      onChange={(e) => setNotificationSettings({...notificationSettings, notifyOnBooking: e.target.checked})}
                      className="mb-3"
                    />
                    <Form.Check
                      type="switch"
                      label="Notify on Check-out"
                      checked={notificationSettings.notifyOnCheckout}
                      onChange={(e) => setNotificationSettings({...notificationSettings, notifyOnCheckout: e.target.checked})}
                      className="mb-3"
                    />
                    <Button
                      className="btn-modern btn-modern-primary"
                      onClick={() => handleSave('notifications', notificationSettings)}
                      disabled={loading}
                    >
                      Save Notification Settings
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

export default SettingsPage;