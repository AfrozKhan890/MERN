// src/pages/Reservations/CreateReservation.js
import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Reservations.css';

const CreateReservation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomType: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    paymentMethod: 'credit-card'
  });

  const [availableRooms] = useState([
    { number: '101', type: 'Standard', price: 100 },
    { number: '102', type: 'Standard', price: 100 },
    { number: '201', type: 'Deluxe', price: 200 },
    { number: '202', type: 'Deluxe', price: 200 },
    { number: '301', type: 'Suite', price: 500 },
    { number: '401', type: 'Presidential', price: 1000 }
  ]);

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
    const room = availableRooms.find(r => r.number === formData.roomNumber);
    if (room) {
      return room.price * calculateNights();
    }
    return 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    if (calculateNights() <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    
    toast.success('Reservation created successfully');
    navigate('/reservations');
  };

  const filteredRooms = availableRooms.filter(room => 
    !formData.roomType || room.type === formData.roomType
  );

  return (
    <div className="reservation-form-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Create New Reservation</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/reservations')}>
          <FaArrowLeft className="me-2" /> Back to Reservations
        </Button>
      </div>

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
                    <option value="Standard">Standard - $100/night</option>
                    <option value="Deluxe">Deluxe - $200/night</option>
                    <option value="Suite">Suite - $500/night</option>
                    <option value="Presidential">Presidential - $1000/night</option>
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
                      <option key={room.number} value={room.number}>
                        Room {room.number} - {room.type}
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
                    <option value="credit-card">Credit Card</option>
                    <option value="debit-card">Debit Card</option>
                    <option value="cash">Cash</option>
                    <option value="bank-transfer">Bank Transfer</option>
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
                <p><strong>Room Rate:</strong> ${availableRooms.find(r => r.number === formData.roomNumber)?.price || 0}/night</p>
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
          <Button variant="primary" type="submit">
            <FaSave className="me-2" /> Create Reservation
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateReservation;