// frontend/src/pages/Auth/Login.jsx (FIXED)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../../services/api';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'admin@luxurystay.com',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post('/auth/login', formData);
      
      if (data.success) {
        // Store user data with token
        const userData = {
          _id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          department: data.user.department,
          token: data.token
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Login successful!');
        
        // Force full page reload to re-initialize the app with the user data
        // This ensures Navbar and Sidebar pick up the user from localStorage
        switch (data.user.role) {
          case 'admin':
            window.location.href = '/dashboard/admin';
            break;
          case 'manager':
            window.location.href = '/dashboard/manager';
            break;
          case 'receptionist':
            window.location.href = '/dashboard/staff';
            break;
          case 'housekeeping':
            window.location.href = '/dashboard/housekeeping';
            break;
          default:
            window.location.href = '/dashboard/staff';
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={5}>
            <Card className="auth-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2>🏨 LuxuryStay</h2>
                  <p className="text-muted">Hotel Management System</p>
                </div>
                
                <h3 className="text-center mb-4">Login</h3>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  <div className="text-center">
                    <Link to="/register" className="text-muted">
                      Don't have an account? Register
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;