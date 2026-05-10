// src/pages/Reservations/CreateReservation.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';
import './Reservations.css';

const CreateReservation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomType: '',
    roomNumber: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    paymentMethod: 'Credit Card'
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await API.get('/rooms?status=Available');
        setAvailableRooms(data.rooms || []);
      } catch (err) {
        toast.error('Failed to load available rooms');
        setError('Could not load room data');
      } finally {
        setFetchingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const calculateTotal = () => {
    const room = availableRooms.find(r => r.roomNumber === formData.roomNumber);
    if (room) {
      return room.price * calculateNights();
    }
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roomType') {
      setFormData(prev => ({
        ...prev,
        roomType: value,
        roomNumber: '',
        roomId: ''
      }));
    } else if (name === 'roomNumber') {
      const selectedRoom = availableRooms.find(r => r.roomNumber === value);
      setFormData(prev => ({
        ...prev,
        roomNumber: value,
        roomId: selectedRoom?._id || '',
        roomType: selectedRoom?.type || prev.roomType
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (calculateNights() <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!formData.roomId) {
      toast.error('Please select a room');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        roomId: formData.roomId,
        guestInfo: {
          name: formData.guestName,
          email: formData.email,
          phone: formData.phone
        },
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        paymentMethod: formData.paymentMethod,
        specialRequests: formData.specialRequests
      };

      await API.post('/reservations', payload);
      toast.success('Reservation created successfully');
      navigate('/reservations');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create reservation';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = availableRooms.filter(room => 
    !formData.roomType || room.type === formData.roomType
  );

  if (fetchingRooms) {
    return (
      <div className="reservation-form-container d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="reservation-form-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Create New Reservation</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/reservations')}>
          <FaArrowLeft className="me-2" /> Back to Reservations
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Guest Information */}
        <Card className="mb-4">
          <Card.Header>
            <h5>Guest Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guest Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleChange}
                    placeholder="Enter guest name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
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
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Room Selection */}
        <Card className="mb-4">
          <Card.Header>
            <h5>Room Selection</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Type</Form.Label>
                  <Form.Select 
                    name="roomType" 
                    value={formData.roomType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Room Type</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential">Presidential</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Number</Form.Label>
                  <Form.Select 
                    name="roomNumber" 
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Room</option>
                    {filteredRooms.map(room => (
                      <option key={room._id} value={room.roomNumber}>
                        Room {room.roomNumber} - {room.type} (${room.price}/night)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stay Details */}
        <Card className="mb-4">
          <Card.Header>
            <h5>Stay Details</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-in Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Check-out Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Adults</Form.Label>
                  <Form.Control
                    type="number"
                    name="adults"
                    value={formData.adults}
                    onChange={handleChange}
                    min="1"
                    max="10"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Children</Form.Label>
                  <Form.Control
                    type="number"
                    name="children"
                    value={formData.children}
                    onChange={handleChange}
                    min="0"
                    max="10"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Special Requests</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Any special requests or preferences..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Pricing Summary */}
        <Card className="mb-4">
          <Card.Header>
            <h5>Pricing Summary</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Number of Nights:</strong> {calculateNights()}</p>
                <p><strong>Room Rate:</strong> ${availableRooms.find(r => r.roomNumber === formData.roomNumber)?.price || 0}/night</p>
              </Col>
              <Col md={6} className="text-end">
                <h4>Total Amount: ${calculateTotal()}</h4>
                <small className="text-muted">*Taxes and additional services not included</small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mb-4">
          <Button variant="secondary" onClick={() => navigate('/reservations')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            <FaSave className="me-2" /> {loading ? 'Creating...' : 'Create Reservation'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateReservation;