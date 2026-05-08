// frontend/src/pages/Auth/Login.jsx - FIXED
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import API from '../../services/api';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      
      const response = await API.post('/auth/login', formData);
      const { data } = response;

      console.log('Login response:', data);

      if (data.success) {
        const userData = {
          _id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          department: data.user.department,
          token: data.token
        };

        localStorage.setItem('user', JSON.stringify(userData));
        
        // Show success toast with role info
        const roleMessage = data.user.role === 'guest' ? 'Welcome to hotel gallery!' : `Welcome back, ${data.user.name}!`;
        toast.success(roleMessage);

        // Get redirect URL from response or determine by role
        let redirectUrl = data.redirectUrl;
        if (!redirectUrl) {
          if (data.user.role === 'guest') {
            redirectUrl = '/gallery';
          } else if (data.user.role === 'admin') {
            redirectUrl = '/dashboard/admin';
          } else if (data.user.role === 'manager') {
            redirectUrl = '/dashboard/manager';
          } else if (data.user.role === 'receptionist') {
            redirectUrl = '/dashboard/staff';
          } else {
            redirectUrl = '/gallery';
          }
        }
        
        console.log('Redirecting to:', redirectUrl);
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else {
        toast.error(data.message || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-orb"></div>
      <div className="auth-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="auth-particle"></div>
        ))}
      </div>

      <div className="auth-wrapper">
        <motion.div
          className="auth-glass-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Form Side */}
          <div className="auth-form-side">
            <div className="auth-animate-up">
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your LuxuryStay account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-animate-up auth-animate-up-delay">
                <div className="auth-input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-animate-up auth-animate-up-delay2">
                <div className="auth-input-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="auth-animate-up auth-animate-up-delay3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
              </div>

              <div className="auth-animate-up auth-animate-up-delay3">
                <motion.button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                      />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </motion.button>
              </div>
            </form>

            <div className="auth-animate-up auth-animate-up-delay3" style={{ textAlign: 'center', marginTop: '28px' }}>
              <span className="auth-link">Don't have an account? </span>
              <Link to="/register" className="auth-link-accent">Create Guest Account</Link>
            </div>
          </div>

          {/* Welcome Side */}
          <div className="auth-welcome-side">
            <div className="auth-animate-right">
              <span style={{ display: 'inline-block', background: 'rgba(244,162,97,0.15)', color: '#F4A261', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px' }}>
                🏨 LuxuryStay Hospitality
              </span>
              <h1>
                Welcome Back to <span className="welcome-accent">LuxuryStay</span>
              </h1>
              <p>
                Experience the pinnacle of hospitality management. Seamlessly manage bookings, rooms, and guest experiences all in one place.
              </p>
              <ul className="welcome-features">
                <li><FaCheckCircle /> Browse luxury hotels</li>
                <li><FaCheckCircle /> Real-time room booking</li>
                <li><FaCheckCircle /> Easy check-in & check-out</li>
                <li><FaCheckCircle /> 24/7 premium support</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;