// frontend/src/pages/Gallery/GalleryPage.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaWifi, FaCoffee, FaSwimmingPool, FaParking, FaDumbbell, FaCreditCard, FaPrint, FaDownload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './GalleryPage.css';

const GalleryPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    roomId: '',
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
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Fallback hotel data
  const fallbackHotels = [
    {
      _id: '1', name: 'Grand Plaza Hotel', location: 'Dubai, UAE',
      description: 'Experience unparalleled luxury at Grand Plaza Hotel. Located in the heart of Dubai.',
      rating: 4.8, images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'],
      amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Parking', 'Gym'],
      rooms: [
        { _id: '101', roomNumber: '101', type: 'Deluxe King', status: 'Available', price: 350, capacity: 2 },
        { _id: '102', roomNumber: '102', type: 'Deluxe King', status: 'Available', price: 350, capacity: 2 },
        { _id: '103', roomNumber: '103', type: 'Suite', status: 'Occupied', price: 550, capacity: 3 },
        { _id: '104', roomNumber: '104', type: 'Standard', status: 'Available', price: 250, capacity: 2 },
      ]
    },
    {
      _id: '2', name: 'Ocean Paradise Resort', location: 'Maldives',
      description: 'Overwater bungalows and crystal clear waters. Perfect honeymoon destination.',
      rating: 4.9, images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
      amenities: ['Free WiFi', 'Overwater Pool', 'Private Beach', 'Spa', 'Water Sports'],
      rooms: [
        { _id: '201', roomNumber: '201', type: 'Overwater Villa', status: 'Available', price: 550, capacity: 2 },
        { _id: '202', roomNumber: '202', type: 'Beach Villa', status: 'Available', price: 450, capacity: 3 },
      ]
    },
    {
      _id: '3', name: 'Mountain View Lodge', location: 'Swiss Alps, Switzerland',
      description: 'Cozy mountain retreat with breathtaking alpine views.',
      rating: 4.7, images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'],
      amenities: ['Free WiFi', 'Fireplace', 'Ski Storage', 'Restaurant', 'Sauna'],
      rooms: [
        { _id: '301', roomNumber: '301', type: 'Standard Room', status: 'Available', price: 280, capacity: 2 },
        { _id: '302', roomNumber: '302', type: 'Deluxe Room', status: 'Available', price: 380, capacity: 3 },
      ]
    },
    {
      _id: '4', name: 'Royal Grand Hotel', location: 'London, UK',
      description: 'Historic luxury hotel in the heart of London.',
      rating: 4.8, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
      amenities: ['Free WiFi', 'Afternoon Tea', 'Concierge', 'Restaurant', 'Bar'],
      rooms: [
        { _id: '401', roomNumber: '401', type: 'Classic Room', status: 'Available', price: 420, capacity: 2 },
        { _id: '402', roomNumber: '402', type: 'Royal Suite', status: 'Available', price: 1200, capacity: 4 },
      ]
    },
    {
      _id: '5', name: 'Sunset Beach Hotel', location: 'Bali, Indonesia',
      description: 'Tropical paradise with stunning sunsets.',
      rating: 4.6, images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80'],
      amenities: ['Free WiFi', 'Beachfront', 'Yoga Classes', 'Restaurant', 'Pool'],
      rooms: [
        { _id: '501', roomNumber: '501', type: 'Garden View', status: 'Available', price: 190, capacity: 2 },
        { _id: '502', roomNumber: '502', type: 'Ocean View', status: 'Available', price: 290, capacity: 2 },
      ]
    },
    {
      _id: '6', name: 'Metropolitan Hotel', location: 'New York, USA',
      description: 'Modern luxury in the heart of Manhattan.',
      rating: 4.7, images: ['https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80'],
      amenities: ['Free WiFi', 'Rooftop Bar', 'Fitness Center', 'Restaurant', 'Business Lounge'],
      rooms: [
        { _id: '601', roomNumber: '601', type: 'Standard Room', status: 'Available', price: 380, capacity: 2 },
        { _id: '602', roomNumber: '602', type: 'Penthouse', status: 'Available', price: 1800, capacity: 6 },
      ]
    }
  ];

  // Fetch hotels from API
  const fetchHotelsFromAPI = async () => {
    try {
      const { data } = await API.get('/hotels');
      if (data.success && data.hotels && data.hotels.length > 0) {
        setHotels(data.hotels);
      } else {
        setHotels(fallbackHotels);
      }
    } catch (error) {
      console.log('Using fallback hotel data');
      setHotels(fallbackHotels);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHotelsFromAPI();
  }, []);

  const handleBookNow = (hotel, room) => {
    if (room.status !== 'Available') {
      alert('This room is not available for booking.');
      return;
    }
    setSelectedHotel({ ...hotel, selectedRoom: room });
    setBookingData({
      ...bookingData,
      roomId: room._id || room.id,
      roomNumber: room.roomNumber,
      price: room.price
    });
    setShowBookingModal(true);
  };

  const calculateTotalAmount = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights * (selectedHotel?.selectedRoom?.price || 0);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    const totalAmount = calculateTotalAmount();
    setBookingResult({
      hotel: selectedHotel,
      room: selectedHotel.selectedRoom,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adults: bookingData.adults,
      children: bookingData.children,
      totalAmount: totalAmount,
      guestName: user.name,
      guestEmail: user.email,
      status: 'Confirmed'
    });
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setTimeout(() => {
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
        nights: Math.ceil((new Date(bookingResult.checkOut) - new Date(bookingResult.checkIn)) / (1000 * 60 * 60 * 24)),
        roomPrice: bookingResult.room.price,
        subtotal: bookingResult.totalAmount,
        tax: (bookingResult.totalAmount * 0.15).toFixed(2),
        total: (bookingResult.totalAmount * 1.15).toFixed(2),
        paymentMethod: 'Credit Card',
        paymentId: `PAY-${Date.now()}`,
        status: 'Paid'
      };
      setInvoice(newInvoice);
      setPaymentSuccess(true);
      
      // Update room status locally
      setHotels(prev => prev.map(h => {
        if (h._id === bookingResult.hotel._id) {
          return {
            ...h,
            rooms: h.rooms.map(r => {
              if (r._id === bookingResult.room._id) return { ...r, status: 'Occupied' };
              return r;
            })
          };
        }
        return h;
      }));

      // Save to localStorage
      const bookings = JSON.parse(localStorage.getItem('guestBookings') || '[]');
      bookings.push({ ...bookingResult, invoice: newInvoice, bookingDate: new Date().toISOString() });
      localStorage.setItem('guestBookings', JSON.stringify(bookings));
    }, 1500);
  };

  const handlePrintInvoice = () => {
    window.print();
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
    a.href = url; a.download = `invoice_${invoice?.invoiceNumber}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <FaWifi className="me-1" />;
    if (lower.includes('pool') || lower.includes('swimming')) return <FaSwimmingPool className="me-1" />;
    if (lower.includes('restaurant') || lower.includes('dining') || lower.includes('tea') || lower.includes('coffee')) return <FaCoffee className="me-1" />;
    if (lower.includes('parking')) return <FaParking className="me-1" />;
    if (lower.includes('gym') || lower.includes('fitness')) return <FaDumbbell className="me-1" />;
    return null;
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <div className="gallery-hero">
        <Container>
          <h1>Luxury Hotels Collection</h1>
          <p>Discover the finest accommodations around the world</p>
        </Container>
      </div>

      <Container className="py-5">
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
                      src={Array.isArray(hotel.images) ? hotel.images[0] : hotel.images || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
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
                      <h6>Available Rooms</h6>
                      <div className="rooms-list">
                        {(hotel.rooms || []).map(room => (
                          <div key={room._id} className="room-item">
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
      </Container>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Your Stay</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHotel && (
            <div>
              <div className="booking-hotel-info mb-4">
                <h5>{selectedHotel.name}</h5>
                <p>Room {selectedHotel.selectedRoom?.roomNumber} - {selectedHotel.selectedRoom?.type}</p>
                <p className="text-muted">Price: ${selectedHotel.selectedRoom?.price}/night</p>
              </div>
              <Form onSubmit={handleBookingSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Check In Date</Form.Label>
                      <Form.Control type="date" value={bookingData.checkIn}
                        onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Check Out Date</Form.Label>
                      <Form.Control type="date" value={bookingData.checkOut}
                        onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Adults</Form.Label>
                      <Form.Control type="number" min="1" max="10" value={bookingData.adults}
                        onChange={(e) => setBookingData({...bookingData, adults: parseInt(e.target.value)})} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Children</Form.Label>
                      <Form.Control type="number" min="0" max="5" value={bookingData.children}
                        onChange={(e) => setBookingData({...bookingData, children: parseInt(e.target.value)})} />
                    </Form.Group>
                  </Col>
                </Row>
                {bookingData.checkIn && bookingData.checkOut && (
                  <Alert variant="info">
                    Total: ${calculateTotalAmount()} ({Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} nights)
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
              <Button variant="primary" className="mt-4" onClick={() => { setShowPaymentModal(false); setBookingResult(null); setInvoice(null); setPaymentSuccess(false); }}>Done</Button>
            </div>
          ) : (
            <Form onSubmit={handlePaymentSubmit}>
              <Alert variant="info"><strong>Demo Payment</strong> - Use any dummy card details</Alert>
              <Form.Group className="mb-3"><Form.Label>Card Number</Form.Label>
                <Form.Control type="text" placeholder="4111 1111 1111 1111" value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Cardholder Name</Form.Label>
                <Form.Control type="text" placeholder="John Doe" value={paymentData.cardName}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})} required /></Form.Group>
              <Row>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Expiry</Form.Label>
                  <Form.Control type="text" placeholder="MM/YY" value={paymentData.expiry}
                    onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})} required /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>CVV</Form.Label>
                  <Form.Control type="text" placeholder="123" value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})} required /></Form.Group></Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button variant="success" type="submit"><FaCreditCard className="me-2" />Pay ${(bookingResult?.totalAmount * 1.15 || 0).toFixed(2)}</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GalleryPage;