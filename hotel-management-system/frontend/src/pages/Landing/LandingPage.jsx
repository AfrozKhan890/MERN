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
import API from '../../services/api';
import './Landing.css';

const LandingPage = () => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [publicReviews, setPublicReviews] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadLandingData = async () => {
      try {
        const [hotelsRes, feedbackRes] = await Promise.all([
          API.get('/hotels'),
          API.get('/feedback/public?limit=3')
        ]);
        setFeaturedHotels((hotelsRes.data?.hotels || []).slice(0, 3));
        setPublicReviews(feedbackRes.data?.data || []);
      } catch (error) {
        setFeaturedHotels([]);
        setPublicReviews([]);
      }
    };

    loadLandingData();
  }, []);

  const handleRoleSelect = (role) => {
    setShowRoleModal(false);
    navigate(role === 'guest' ? '/register' : '/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard'); // or wherever you want logged-in users to go
    } else {
      setShowRoleModal(true);
    }
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

  const stats = [
    { number: '500+', label: 'Hotels Worldwide' },
    { number: '50K+', label: 'Monthly Bookings' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Premium Support' },
  ];

  return (
    <div className="landing-page">
      {/* Role Selection Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose Your Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={6}>
              <Button 
                variant="outline-primary" 
                className="w-100 py-3"
                onClick={() => handleRoleSelect('guest')}
                style={{ borderRadius: '12px' }}
              >
                <FaUsers size={24} className="mb-2" />
                <div>Guest</div>
                <small>Book rooms & view hotels</small>
              </Button>
            </Col>
            <Col xs={6}>
              <Button 
                variant="outline-primary" 
                className="w-100 py-3"
                onClick={() => handleRoleSelect('hotel')}
                style={{ borderRadius: '12px' }}
              >
                <FaHotel size={24} className="mb-2" />
                <div>Hotel Owner</div>
                <small>Manage your property</small>
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

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
                    <FaImage style={{ marginRight: '6px' }} /> Gallery
                  </button>
                  <button className="btn-get-started" onClick={handleLogout} style={{ background: '#C1121F' }}>
                    <FaSignOutAlt style={{ marginRight: '6px' }} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-get-started" onClick={() => navigate('/gallery')}>
                    <FaImage style={{ marginRight: '6px' }} /> Gallery
                  </button>
                  <button className="btn-get-started" onClick={() => setShowRoleModal(true)}>
                    Get Started
                  </button>
                </>
              )}
            </div>
            
            <button className="landing-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </Container>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          {user ? (
            <>
              <button className="btn-mobile" onClick={() => { navigate('/gallery'); setMobileMenuOpen(false); }}>
                <FaImage /> Gallery
              </button>
              <button className="btn-mobile" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-mobile" onClick={() => { navigate('/gallery'); setMobileMenuOpen(false); }}>
                <FaImage /> Gallery
              </button>
              <button className="btn-mobile btn-primary-mobile" onClick={() => { setShowRoleModal(true); setMobileMenuOpen(false); }}>
                Get Started
              </button>
            </>
          )}
        </div>
      )}

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
                  Streamline bookings, manage rooms, and enhance guest experience with our all-in-one platform.
                </p>
                <div className="hero-buttons">
                  <Button variant="primary" size="lg" onClick={() => navigate('/gallery')}>
                    Browse Gallery <FaArrowRight style={{ marginLeft: '8px' }} />
                  </Button>
                  <Button variant="outline-light" size="lg" onClick={handleGetStarted}>
                    Get Started <FaArrowRight style={{ marginLeft: '8px' }} />
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
            <h2 className="section-title">Guest Feedback</h2>
            <p className="section-subtitle">Live reviews submitted by platform users</p>
          </motion.div>
          <Row className="g-4">
            {(publicReviews.length > 0 ? publicReviews : [{
              rating: 5,
              comment: 'Great booking experience and excellent room service.',
              title: 'Amazing stay',
              guest: { firstName: 'Guest', lastName: 'User' }
            }]).map((item, index) => (
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
                        <div className="testimonial-avatar">
                          {(item.guest?.firstName?.[0] || 'G')}{(item.guest?.lastName?.[0] || 'U')}
                        </div>
                        <div>
                          <div className="mb-1">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <FaStar key={i} className="text-warning" size={14} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="testimonial-text">"{item.comment || item.title}"</p>
                      <div className="testimonial-author">
                        <strong>{`${item.guest?.firstName || 'Guest'} ${item.guest?.lastName || ''}`.trim()}</strong>
                        <small className="text-muted d-block">{item.title || 'Guest Review'}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Live Hotel Feed */}
      <section className="features-section">
        <Container>
          <motion.div
            className="text-center mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <span className="section-badge">Live Hotel Feed</span>
            <h2 className="section-title">Recently Added Hotels</h2>
            <p className="section-subtitle">New properties added by admins appear here automatically</p>
          </motion.div>
          <Row className="g-4">
            {featuredHotels.length > 0 ? featuredHotels.map((hotel) => (
              <Col md={4} key={hotel._id}>
                <Card className="feature-card h-100">
                  <Card.Img
                    variant="top"
                    src={hotel.images?.[0]}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <h5>{hotel.name}</h5>
                    <p className="mb-1 text-muted">{hotel.location}</p>
                    <p style={{ fontSize: '0.9rem' }}>{hotel.description?.slice(0, 90)}...</p>
                    <Button variant="outline-primary" onClick={() => navigate('/gallery')}>
                      View in Gallery
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )) : (
              <Col>
                <div className="text-center text-muted">No hotel listings yet.</div>
              </Col>
            )}
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
            <div className="hero-buttons" style={{ justifyContent: 'center' }}>
              <Button 
                size="lg" 
                style={{ background: '#F4A261', border: 'none', padding: '16px 40px', fontWeight: 700, borderRadius: '12px', fontSize: '1.1rem' }}
                onClick={() => navigate('/gallery')}
              >
                Browse Gallery <FaArrowRight style={{ marginLeft: '8px' }} />
              </Button>
              <Button 
                size="lg" 
                variant="outline-light"
                style={{ padding: '16px 40px', fontWeight: 700, borderRadius: '12px', fontSize: '1.1rem' }}
                onClick={handleGetStarted}
              >
                Get Started <FaArrowRight style={{ marginLeft: '8px' }} />
              </Button>
            </div>
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
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {user ? (
                  <>
                    <Button style={{ background: '#F4A261', border: 'none', fontWeight: 600 }} onClick={() => navigate('/gallery')}>
                      View Gallery
                    </Button>
                    <Button variant="outline-light" style={{ fontWeight: 600 }} onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button style={{ background: '#F4A261', border: 'none', fontWeight: 600 }} onClick={() => navigate('/gallery')}>
                      View Gallery
                    </Button>
                    <Button variant="outline-light" style={{ fontWeight: 600 }} onClick={() => setShowRoleModal(true)}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </Col>
          </Row>
          <hr />
          <p className="text-center mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} LuxuryStay Hospitality. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;