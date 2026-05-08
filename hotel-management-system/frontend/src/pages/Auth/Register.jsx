// frontend/src/pages/Auth/Register.jsx - FIXED
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';
import API from '../../services/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Registering user:', { name: formData.name, email: formData.email });
      
      // Only send name, email, password, phone - NO role field
      const response = await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      const { data } = response;
      console.log('Register response:', data);

      if (data.success) {
        toast.success('Account created successfully! 🎉 Please login to continue.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
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
          {/* Welcome Side (Left on Register) */}
          <div className="auth-welcome-side">
            <div className="auth-animate-left">
              <span style={{ display: 'inline-block', background: 'rgba(244,162,97,0.15)', color: '#F4A261', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px' }}>
                🏨 LuxuryStay Hospitality
              </span>
              <h1>
                Join <span className="welcome-accent">LuxuryStay</span> Today
              </h1>
              <p>
                Create your guest account and start exploring luxury hotels. Book rooms, manage reservations, and enjoy premium services.
              </p>
              <ul className="welcome-features">
                <li><FaCheckCircle /> Browse 6+ luxury hotels</li>
                <li><FaCheckCircle /> Real-time room availability</li>
                <li><FaCheckCircle /> Secure online booking</li>
                <li><FaCheckCircle /> Easy check-in/check-out</li>
                <li><FaCheckCircle /> 24/7 customer support</li>
              </ul>
            </div>
          </div>

          {/* Form Side (Right on Register) */}
          <div className="auth-form-side">
            <div className="auth-animate-up">
              <h2>Create Guest Account</h2>
              <p className="auth-subtitle">Sign up to book luxury hotels</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-animate-up auth-animate-up-delay">
                <div className="auth-input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-animate-up auth-animate-up-delay2">
                <div className="auth-input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-animate-up auth-animate-up-delay2">
                <div className="auth-input-group">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-animate-up auth-animate-up-delay2" style={{ display: 'flex', gap: '12px' }}>
                <div className="auth-input-group" style={{ flex: 1 }}>
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="auth-input-group" style={{ flex: 1 }}>
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                      Creating Account...
                    </span>
                  ) : 'Create Guest Account'}
                </motion.button>
              </div>
            </form>

            <div className="auth-animate-up auth-animate-up-delay3" style={{ textAlign: 'center', marginTop: '24px' }}>
              <span className="auth-link">Already have an account? </span>
              <Link to="/login" className="auth-link-accent">Sign In</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;