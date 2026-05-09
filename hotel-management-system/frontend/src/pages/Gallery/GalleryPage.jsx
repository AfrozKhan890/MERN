// frontend/src/pages/Gallery/GalleryPage.jsx - COMPLETE FIXED (NO SPAM)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, Button, Modal, Badge, Form, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaWifi, FaCoffee, FaSwimmingPool, FaParking, FaDumbbell, FaCreditCard, FaPrint, FaDownload, FaCheckCircle, FaTimesCircle, FaBed } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { onEvent } from '../../services/socket';
import './GalleryPage.css';

const GalleryPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [bookingResult, setBookingResult] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    title: '',
    comment: '',
    suggestions: ''
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const intervalRef = useRef(null);

  // Fetch hotels from API - NO CACHE
  const fetchHotels = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      // Add cache-busting timestamp
      const { data } = await API.get('/hotels?t=' + Date.now());
      
      if (data.success && data.hotels) {
        setHotels(data.hotels);
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error('Fetch hotels error:', error);
      setHotels([]);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch only once
  useEffect(() => {
    // Initial fetch
    fetchHotels(true);
    
    // Set up interval for background refresh (every 30 seconds instead of 10)
    intervalRef.current = setInterval(() => {
      fetchHotels(false); // Silent refresh - no loading spinner
    }, 30000);
    
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchHotels]);

  useEffect(() => {
    const unsubscribeHotel = onEvent('hotel-updated', () => {
      fetchHotels(false);
    });

    return () => {
      unsubscribeHotel();
    };
  }, [fetchHotels]);

  const handleBookNow = (hotel, room) => {
    if (!user) {
      toast.info('Please login to book a room.');
      navigate('/login');
      return;
    }

    if (room.status !== 'Available') {
      toast.error('This room is not available for booking.');
      return;
    }
    setSelectedHotel(hotel);
    setSelectedRoom(room);
    setBookingData({
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0
    });
    setError('');
    setShowBookingModal(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'guest') return;

    setSubmittingFeedback(true);
    try {
      const { data } = await API.post('/feedback', feedbackData);
      if (data.success) {
        toast.success('Thanks! Your feedback has been submitted.');
        setFeedbackData({
          rating: 5,
          title: '',
          comment: '',
          suggestions: ''
        });
      }
    } catch (submitError) {
      toast.error(submitError.response?.data?.message || 'Unable to submit feedback right now');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalAmount = () => {
    const nights = calculateNights();
    return nights * (selectedRoom?.price || 0);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }
    
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      setError('Check-in date cannot be in the past');
      return;
    }
    
    if (checkOutDate <= checkInDate) {
      setError('Check-out date must be after check-in date');
      return;
    }
    
    const nights = calculateNights();
    if (nights <= 0) {
      setError('Please select valid dates');
      return;
    }

    const totalAmount = calculateTotalAmount();
    
    setBookingResult({
      hotel: selectedHotel,
      room: selectedRoom,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults: bookingData.adults,
      children: bookingData.children,
      totalAmount: totalAmount,
      guestName: user.name,
      guestEmail: user.email,
      guestPhone: user.phone || '',
      status: 'Confirmed'
    });
    
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    setError('');
    
    try {
      const checkInDate = new Date(bookingResult.checkIn);
      const checkOutDate = new Date(bookingResult.checkOut);
      
      const reservationData = {
        roomId: selectedRoom._id,
        guestInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A'
        },
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: parseInt(bookingResult.adults),
        children: parseInt(bookingResult.children),
        paymentMethod: 'Credit Card'
      };
      
      console.log('Sending reservation:', reservationData);
      
      const { data } = await API.post('/reservations', reservationData);
      
      if (data.success) {
        const nights = calculateNights();
        const newInvoice = {
          invoiceNumber: `INV-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          guestName: user.name,
          guestEmail: user.email,
          hotelName: bookingResult.hotel.name,
          roomNumber: bookingResult.room.roomNumber,
          roomType: bookingResult.room.type,
          checkIn: bookingResult.checkIn,
          checkOut: bookingResult.checkOut,
          nights: nights,
          roomPrice: bookingResult.room.price,
          subtotal: bookingResult.totalAmount,
          tax: (bookingResult.totalAmount * 0.15).toFixed(2),
          total: (bookingResult.totalAmount * 1.15).toFixed(2),
          paymentMethod: 'Credit Card',
          paymentId: `PAY-${Date.now()}`,
          status: 'Paid',
          reservationId: data.reservation?._id
        };
        
        setInvoice(newInvoice);
        setPaymentSuccess(true);
        
        // IMPORTANT: Refresh hotels immediately after booking
        await fetchHotels(false);
        
        toast.success('Booking confirmed successfully!');
      } else {
        throw new Error(data.message || 'Reservation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Payment failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Invoice ${invoice?.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          .text-center { text-align: center; }
          .header { text-align: center; margin-bottom: 30px; }
          .total { font-weight: bold; font-size: 1.2em; }
        </style>
        </head>
        <body>
          <div class="header">
            <h1>LuxuryStay Hospitality</h1>
            <p>Booking Invoice</p>
          </div>
          <p><strong>Invoice:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${invoice.date}</p>
          <p><strong>Guest:</strong> ${invoice.guestName}</p>
          <p><strong>Hotel:</strong> ${invoice.hotelName}</p>
          <p><strong>Room:</strong> ${invoice.roomNumber} - ${invoice.roomType}</p>
          <p><strong>Stay:</strong> ${invoice.checkIn} to ${invoice.checkOut} (${invoice.nights} nights)</p>
          <hr/>
          <h3>Payment Summary</h3>
          <table>
            <tr><th>Description</th><th>Amount</th></tr>
            <tr><td>Room Charges (${invoice.nights} nights @ $${invoice.roomPrice}/night)</td><td>$${invoice.subtotal}</td></tr>
            <tr><td>Tax (15%)</td><td>$${invoice.tax}</td></tr>
            <tr class="total"><td>TOTAL</td><td>$${invoice.total}</td></tr>
            <tr><td>Payment Method</td><td>${invoice.paymentMethod}</td></tr>
            <tr><td>Status</td><td style="color:green">${invoice.status}</td></tr>
          </table>
          <p class="text-center">Thank you for choosing LuxuryStay!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadInvoice = () => {
    const invoiceHTML = `
      <html><head><title>Invoice ${invoice?.invoiceNumber}</title>
      <style>body{font-family:Arial;padding:40px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px}th{background:#f5f5f5}</style></head>
      <body><h1>LuxuryStay Hospitality</h1><p>Invoice: ${invoice?.invoiceNumber}</p>
      <p>Guest: ${invoice?.guestName}</p><p>Hotel: ${invoice?.hotelName}</p>
      <p>Room: ${invoice?.roomNumber} - ${invoice?.roomType}</p>
      <p>Total: $${invoice?.total}</p><p>Status: ${invoice?.status}</p></body></html>`;
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoice?.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <FaWifi className="me-1" />;
    if (lower.includes('pool')) return <FaSwimmingPool className="me-1" />;
    if (lower.includes('restaurant') || lower.includes('dining') || lower.includes('coffee')) return <FaCoffee className="me-1" />;
    if (lower.includes('parking')) return <FaParking className="me-1" />;
    if (lower.includes('gym') || lower.includes('fitness')) return <FaDumbbell className="me-1" />;
    return null;
  };

  const getAvailableRoomsCount = (rooms) => {
    return rooms?.filter(room => room.status === 'Available').length || 0;
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading luxury hotels...</p>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <div className="gallery-hero">
        <Container>
          <h1>Luxury Hotels Collection</h1>
          <p>Discover the finest accommodations around the world</p>
          {user && (
            <div className="mt-3">
              <span className="text-light">Welcome, {user.name}!</span>
              <button 
                className="btn btn-sm btn-outline-light ms-3"
                onClick={() => fetchHotels(false)}
                disabled={refreshing}
              >
                {refreshing ? <Spinner as="span" animation="border" size="sm" /> : '⟳ Refresh'}
              </button>
            </div>
          )}
        </Container>
      </div>

      <Container className="py-5">
        {!user && (
          <Alert variant="info">
            Browse hotels as a guest. To book a room, please <a href="/login">login</a>.
          </Alert>
        )}

        {hotels.length === 0 ? (
          <div className="text-center py-5">
            <h3>No hotels available</h3>
            <p>Please check back later for luxury accommodations.</p>
          </div>
        ) : (
          <Row className="g-4">
            {hotels.map((hotel, index) => (
              <Col lg={4} md={6} key={hotel._id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hotel-card">
                    <div className="hotel-image-wrapper">
                      <Card.Img 
                        variant="top" 
                        src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                        className="hotel-image" 
                      />
                      <div className="hotel-rating">
                        <FaStar className="text-warning me-1" />
                        {hotel.rating}
                      </div>
                    </div>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="hotel-title">{hotel.name}</Card.Title>
                        <Badge bg="info">{getAvailableRoomsCount(hotel.rooms)} rooms available</Badge>
                      </div>
                      <div className="hotel-location mb-2">
                        <FaMapMarkerAlt className="me-1" />
                        {hotel.location}
                      </div>
                      <Card.Text className="hotel-description">
                        {hotel.description?.substring(0, 120)}...
                      </Card.Text>
                      <div className="hotel-amenities mb-3">
                        {(hotel.amenities || []).slice(0, 4).map((amenity, i) => (
                          <span key={i} className="amenity-badge">
                            {getAmenityIcon(amenity)}{amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="rooms-section mt-3">
                        <h6><FaBed className="me-2" />Available Rooms</h6>
                        <div className="rooms-list">
                          {(hotel.rooms || []).map((room, idx) => (
                            <div key={room._id || idx} className="room-item">
                              <div className="room-info">
                                <span className="room-number">Room {room.roomNumber}</span>
                                <span className="room-type">{room.type}</span>
                                <span className={`room-status ${room.status?.toLowerCase()}`}>
                                  {room.status === 'Available' && <FaCheckCircle className="me-1" />}
                                  {(room.status === 'Occupied' || room.status === 'Reserved') && <FaTimesCircle className="me-1" />}
                                  {room.status}
                                </span>
                              </div>
                              <div className="room-action">
                                <span className="room-price">${room.price}/night</span>
                                <Button
                                  variant={room.status === 'Available' ? 'primary' : 'secondary'}
                                  size="sm"
                                  disabled={room.status !== 'Available'}
                                  onClick={() => handleBookNow(hotel, room)}
                                >
                                  {room.status === 'Available' ? 'Book Now' : 'Unavailable'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {user?.role === 'guest' && (
        <Container className="pb-5">
          <Card>
            <Card.Body>
              <h5 className="mb-3">Share Your Feedback</h5>
              <Form onSubmit={handleFeedbackSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rating</Form.Label>
                      <Form.Select
                        value={feedbackData.rating}
                        onChange={(e) => setFeedbackData({ ...feedbackData, rating: Number(e.target.value) })}
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        value={feedbackData.title}
                        onChange={(e) => setFeedbackData({ ...feedbackData, title: e.target.value })}
                        placeholder="Short summary"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    required
                    value={feedbackData.comment}
                    onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                    placeholder="Tell us about your experience"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Suggestions</Form.Label>
                  <Form.Control
                    value={feedbackData.suggestions}
                    onChange={(e) => setFeedbackData({ ...feedbackData, suggestions: e.target.value })}
                    placeholder="What should we improve?"
                  />
                </Form.Group>
                <Button type="submit" disabled={submittingFeedback}>
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      )}

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Your Stay at {selectedHotel?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHotel && selectedRoom && (
            <div>
              <div className="booking-hotel-info mb-4">
                <h5>Room {selectedRoom.roomNumber} - {selectedRoom.type}</h5>
                <p className="text-muted">Price: ${selectedRoom.price}/night</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleBookingSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Check In Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Check Out Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Adults</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={bookingData.adults}
                        onChange={(e) => setBookingData({...bookingData, adults: parseInt(e.target.value)})}
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Children</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="0" 
                        max="5" 
                        value={bookingData.children}
                        onChange={(e) => setBookingData({...bookingData, children: parseInt(e.target.value)})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {bookingData.checkIn && bookingData.checkOut && (
                  <Alert variant="info">
                    Total: ${calculateTotalAmount()} ({calculateNights()} nights)
                  </Alert>
                )}
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowBookingModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">Proceed to Payment</Button>
                </div>
              </Form>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => !paymentSuccess && setShowPaymentModal(false)} centered>
        <Modal.Header closeButton={!paymentSuccess}>
          <Modal.Title>{paymentSuccess ? 'Payment Successful!' : 'Complete Payment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentSuccess ? (
            <div className="text-center">
              <FaCheckCircle style={{ fontSize: '60px', color: '#10b981' }} className="mb-3" />
              <h4>Booking Confirmed!</h4>
              <p>Your room has been booked successfully.</p>
              {invoice && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <Button variant="outline-primary" onClick={handlePrintInvoice}><FaPrint className="me-2" />Print</Button>
                  <Button variant="outline-secondary" onClick={handleDownloadInvoice}><FaDownload className="me-2" />Download</Button>
                </div>
              )}
              <Button variant="primary" className="mt-4" onClick={() => { 
                setShowPaymentModal(false); 
                setBookingResult(null); 
                setInvoice(null); 
                setPaymentSuccess(false);
                fetchHotels(false);
              }}>Done</Button>
            </div>
          ) : (
            <Form onSubmit={handlePaymentSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}
              <Alert variant="info"><strong>Demo Payment</strong> - Use any dummy card details</Alert>
              <Form.Group className="mb-3">
                <Form.Label>Card Number</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="4111 1111 1111 1111" 
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  required 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Cardholder Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="John Doe" 
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                  required 
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="MM/YY" 
                      value={paymentData.expiry}
                      onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CVV</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="123" 
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button variant="success" type="submit" disabled={processingPayment}>
                  <FaCreditCard className="me-2" />
                  {processingPayment ? 'Processing...' : `Pay $${(bookingResult?.totalAmount * 1.15 || 0).toFixed(2)}`}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GalleryPage;