// frontend/src/pages/Landing/LandingPage.jsx - COMPLETE FIXED
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FaHotel, FaChartBar, FaUsers, FaCalendarCheck, 
  FaStar, FaShieldAlt, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaArrowRight, FaCheckCircle, FaBed, FaBroom, FaFileInvoiceDollar,
  FaTwitter, FaLinkedinIn, FaInstagram, FaBars, FaTimes,
  FaSignOutAlt, FaImage
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const LandingPage = () => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
const user = null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRoleSelect = (role) => {
    setShowRoleModal(false);
    navigate(role === 'guest' ? '/register' : '/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const features = [
    { icon: <FaBed size={28} />, title: 'Room Management', desc: 'Real-time inventory tracking with instant availability updates and pricing control.' },
    { icon: <FaCalendarCheck size={28} />, title: 'Reservation System', desc: 'Seamless booking experience with automated confirmation and calendar sync.' },
    { icon: <FaFileInvoiceDollar size={28} />, title: 'Billing & Invoicing', desc: 'Generate accurate bills with tax calculations and multiple payment methods.' },
    { icon: <FaBroom size={28} />, title: 'Housekeeping', desc: 'Assign and track cleaning tasks with real-time room status updates.' },
    { icon: <FaChartBar size={28} />, title: 'Reports & Analytics', desc: 'Data-driven insights on occupancy, revenue, and guest satisfaction.' },
    { icon: <FaShieldAlt size={28} />, title: 'Secure & Scalable', desc: 'Enterprise-grade security with role-based access and encrypted data.' },
  ];

  const testimonials = [
    { initials: 'SJ', name: 'Sarah Johnson', role: 'Hotel Manager, Grand Palace', text: 'LuxuryStay transformed our operations completely. We saw a 40% increase in booking efficiency within the first month!', rating: 5 },
    { initials: 'MC', name: 'Michael Chen', role: 'Operations Director, SeaView Resorts', text: 'The analytics dashboard gives us insights we never had before. Revenue has increased by 25% since implementing LuxuryStay.', rating: 5 },
    { initials: 'ED', name: 'Emily Davis', role: 'Guest Relations, Mountain Lodge', text: 'Our guests love the seamless booking experience. Check-in time has been reduced from 10 minutes to under 2 minutes!', rating: 5 },
  ];

  const stats = [
    { number: '500+', label: 'Hotels Worldwide' },
    { number: '50K+', label: 'Monthly Bookings' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Premium Support' },
  ];

  return (
    <div className="landing-page">
      {/* Navbar - Same for all users, only buttons change */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <motion.div 
              className="landing-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FaHotel size={30} /> <span>LuxuryStay</span>
            </motion.div>
            
            <div className="landing-nav-links">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#testimonials">Reviews</a>
              <a href="#contact">Contact</a>
              
              {user ? (
                <>
                  <button className="btn-get-started" onClick={() => navigate('/gallery')}>
                    <FaImage style={{ marginRight: '6px' }} /> View Hotels
                  </button>
                  <button className="btn-get-started" onClick={handleLogout} style={{ background: '#C1121F' }}>
                    <FaSignOutAlt style={{ marginRight: '6px' }} /> Logout
                  </button>
                </>
              ) : (
                <button className="btn-get-started" onClick={() => setShowRoleModal(true)}>
                  Get Started <FaArrowRight style={{ marginLeft: '6px', fontSize: '0.8rem' }} />
                </button>
              )}
            </div>
            
            <button className="landing-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                <span className="section-badge" style={{ background: 'rgba(244,162,97,0.15)', color: '#F4A261' }}>
                  🏨 Premium Hotel Management
                </span>
                <h1 className="hero-title">
                  Experience Smart<br />
                  <span className="hero-highlight">Hotel Management</span>
                </h1>
                <p className="hero-subtitle">
                  Streamline bookings, manage rooms, and enhance guest experience with our all-in-one platform trusted by 500+ hotels worldwide.
                </p>
                <div className="hero-buttons">
                  {user ? (
                    <Button variant="primary" size="lg" onClick={() => navigate('/gallery')}>
                      View Hotels <FaArrowRight style={{ marginLeft: '8px' }} />
                    </Button>
                  ) : (
                    <Button variant="primary" size="lg" onClick={() => setShowRoleModal(true)}>
                      Get Started Free <FaArrowRight style={{ marginLeft: '8px' }} />
                    </Button>
                  )}
                  <Button variant="outline-light" size="lg" href="#features">
                    Explore Features
                  </Button>
                </div>
                <div className="hero-stats">
                  {stats.slice(0, 3).map((stat, i) => (
                    <div className="stat-item" key={i}>
                      <h3>{stat.number}</h3>
                      <p>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div 
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="d-none d-lg-block"
              >
                <div className="hero-dashboard-preview">
                  <div className="preview-header">
                    <div className="preview-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div className="preview-content">
                    <Row className="g-2 mb-2">
                      <Col xs={6}>
                        <div className="preview-card p-3">
                          <small>Total Rooms</small>
                          <h4>150</h4>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="preview-card p-3">
                          <small>Occupancy Rate</small>
                          <h4 className="text-success">85%</h4>
                        </div>
                      </Col>
                    </Row>
                    <Row className="g-2">
                      <Col xs={12}>
                        <div className="preview-card p-3">
                          <small>Today's Revenue</small>
                          <h3>$12,450</h3>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <Container>
          <motion.div 
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <span className="section-badge">Core Features</span>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">Powerful tools to manage every aspect of your hotel operations</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Row className="g-4">
              {features.map((feature, index) => (
                <Col md={6} lg={4} key={index}>
                  <motion.div variants={fadeInUp}>
                    <Card className="feature-card">
                      <Card.Body className="text-center p-4">
                        <div className="feature-icon">{feature.icon}</div>
                        <h5>{feature.title}</h5>
                        <p>{feature.desc}</p>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="about-image-wrapper">
                  <img 
                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80" 
                    alt="Luxury Hotel Lobby"
                    style={{ width: '100%', borderRadius: '16px' }}
                  />
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="section-badge">Why Choose Us</span>
                <h2 className="section-title">Why LuxuryStay?</h2>
                <p className="section-subtitle">
                  We deliver a comprehensive hotel management solution that combines elegance with efficiency, 
                  helping you focus on what matters most — your guests.
                </p>
                <ul className="about-list">
                  <li><FaCheckCircle className="check-icon" /> Real-time room availability</li>
                  <li><FaCheckCircle className="check-icon" /> Automated billing with multiple payment options</li>
                  <li><FaCheckCircle className="check-icon" /> Role-based access for secure team collaboration</li>
                  <li><FaCheckCircle className="check-icon" /> Detailed analytics for data-driven decisions</li>
                  <li><FaCheckCircle className="check-icon" /> 24/7 dedicated support team</li>
                </ul>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section" id="stats">
        <Container>
          <Row className="text-center g-4">
            {stats.map((stat, i) => (
              <Col xs={6} md={3} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="stats-big-number">{stat.number}</div>
                  <div className="stats-label">{stat.label}</div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="testimonials">
        <Container>
          <motion.div 
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">Trusted by Industry Leaders</h2>
            <p className="section-subtitle">See what hotel professionals say about LuxuryStay</p>
          </motion.div>
          <Row className="g-4">
            {testimonials.map((item, index) => (
              <Col md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card className="testimonial-card">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="testimonial-avatar">{item.initials}</div>
                        <div>
                          <div className="mb-1">
                            {[...Array(item.rating)].map((_, i) => (
                              <FaStar key={i} className="text-warning" size={14} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="testimonial-text">"{item.text}"</p>
                      <div className="testimonial-author">
                        <strong>{item.name}</strong>
                        <small className="text-muted d-block">{item.role}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Transform Your Hotel Operations?</h2>
            <p>Join 500+ hotels that trust LuxuryStay for their management needs.</p>
            {user ? (
              <Button 
                size="lg" 
                style={{ background: '#F4A261', border: 'none', padding: '16px 40px', fontWeight: 700, borderRadius: '12px', fontSize: '1.1rem' }}
                onClick={() => navigate('/gallery')}
              >
                Browse Hotels <FaArrowRight style={{ marginLeft: '8px' }} />
              </Button>
            ) : (
              <Button 
                size="lg" 
                style={{ background: '#F4A261', border: 'none', padding: '16px 40px', fontWeight: 700, borderRadius: '12px', fontSize: '1.1rem' }}
                onClick={() => setShowRoleModal(true)}
              >
                Get Started Now <FaArrowRight style={{ marginLeft: '8px' }} />
              </Button>
            )}
          </motion.div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="contact-card">
                  <div className="text-center mb-4">
                    <span className="section-badge">Contact</span>
                    <h2 className="section-title">Get In Touch</h2>
                    <p className="section-subtitle">We'd love to hear from you</p>
                  </div>
                  <Row className="g-4">
                    <Col md={4}>
                      <div className="contact-item text-center">
                        <div className="contact-icon"><FaPhone /></div>
                        <h6>Phone</h6>
                        <p className="text-muted mb-0">(555) 123-4567</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="contact-item text-center">
                        <div className="contact-icon"><FaEnvelope /></div>
                        <h6>Email</h6>
                        <p className="text-muted mb-0">info@luxurystay.com</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="contact-item text-center">
                        <div className="contact-icon"><FaMapMarkerAlt /></div>
                        <h6>Address</h6>
                        <p className="text-muted mb-0">123 Hotel Street, Luxury City</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <Row className="g-4">
            <Col lg={4}>
              <div className="footer-brand">
                <FaHotel size={24} /> LuxuryStay
              </div>
              <p className="mt-3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Premium hotel management solution for modern hospitality businesses worldwide.
              </p>
              <div className="footer-social">
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedinIn /></a>
                <a href="#"><FaInstagram /></a>
              </div>
            </Col>
            <Col lg={2} md={4}>
              <h6>Product</h6>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Updates</a></li>
              </ul>
            </Col>
            <Col lg={2} md={4}>
              <h6>Company</h6>
              <ul className="footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </Col>
            <Col lg={4} md={4}>
              <h6>Get Started</h6>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Ready to streamline your hotel operations?
              </p>
              {user ? (
                <Button style={{ background: '#F4A261', border: 'none', fontWeight: 600 }} onClick={() => navigate('/gallery')}>
                  View Hotels
                </Button>
              ) : (
                <Button style={{ background: '#F4A261', border: 'none', fontWeight: 600 }} onClick={() => setShowRoleModal(true)}>
                  Start Free Trial
                </Button>
              )}
            </Col>
          </Row>
          <hr />
          <p className="text-center mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} LuxuryStay Hospitality. All rights reserved.
          </p>
        </Container>
      </footer>

      {/* Role Selection Modal - Only for non-logged in users */}
      {!user && (
        <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered className="role-modal">
          <Modal.Header closeButton style={{ borderBottom: '1px solid #E5E7EB' }}>
            <Modal.Title style={{ fontWeight: 700, color: '#0B1D3A' }}>Select Your Role</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p className="text-muted mb-4">Choose your role to access the appropriate dashboard</p>
            <div className="role-options">
              <div className="role-option" onClick={() => handleRoleSelect('admin')}>
                <div className="role-icon" style={{ background: 'rgba(193,18,31,0.1)', color: '#C1121F' }}>
                  <FaShieldAlt size={20} />
                </div>
                <div>
                  <strong>Administrator</strong>
                  <p className="text-muted mb-0">Full system access & control</p>
                </div>
              </div>
              <div className="role-option" onClick={() => handleRoleSelect('manager')}>
                <div className="role-icon" style={{ background: 'rgba(11,29,58,0.08)', color: '#0B1D3A' }}>
                  <FaChartBar size={20} />
                </div>
                <div>
                  <strong>Hotel Manager</strong>
                  <p className="text-muted mb-0">Manage daily operations</p>
                </div>
              </div>
              <div className="role-option" onClick={() => handleRoleSelect('staff')}>
                <div className="role-icon" style={{ background: 'rgba(45,106,79,0.1)', color: '#2D6A4F' }}>
                  <FaUsers size={20} />
                </div>
                <div>
                  <strong>Staff / Receptionist</strong>
                  <p className="text-muted mb-0">Front desk & guest services</p>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default LandingPage;