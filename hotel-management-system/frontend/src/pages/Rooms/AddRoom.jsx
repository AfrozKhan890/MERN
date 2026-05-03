// src/pages/Rooms/AddRoom.js
import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Rooms.css';

const AddRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    type: 'Standard',
    price: '',
    capacity: '2',
    status: 'Available',
    description: '',
    amenities: []
  });

  const amenitiesList = [
    'WiFi',
    'TV',
    'Air Conditioning',
    'Mini Bar',
    'Room Service',
    'Balcony',
    'Jacuzzi',
    'Kitchen',
    'Workspace',
    'Safe'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.roomNumber || !formData.floor || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success('Room added successfully!');
      navigate('/rooms');
    }, 1000);
  };

  return (
    <div className="add-room-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Add New Room</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/rooms')}>
          <FaArrowLeft className="me-2" /> Back to Rooms
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>
            <h5>Basic Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="e.g., 101"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor *</Form.Label>
                  <Form.Select 
                    name="floor" 
                    value={formData.floor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="4th Floor">4th Floor</option>
                    <option value="5th Floor">5th Floor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Type *</Form.Label>
                  <Form.Select 
                    name="type" 
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential">Presidential</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <h5>Pricing & Capacity</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price per Night ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity (Persons) *</Form.Label>
                  <Form.Select 
                    name="capacity" 
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 Persons</option>
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons</option>
                    <option value="5">5 Persons</option>
                    <option value="6">6+ Persons</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <h5>Amenities</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {amenitiesList.map((amenity, index) => (
                <Col md={4} key={index}>
                  <Form.Check
                    type="checkbox"
                    label={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="mb-2"
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <h5>Additional Information</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter room description..."
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mb-4">
          <Button variant="secondary" onClick={() => navigate('/rooms')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <FaSave className="me-2" /> Save Room
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddRoom;