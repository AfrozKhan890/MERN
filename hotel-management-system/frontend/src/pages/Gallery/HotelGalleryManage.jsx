import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaHotel, FaStar, FaMapMarkerAlt, FaBed, FaImage, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { onEvent } from '../../services/socket';
import './HotelGalleryManage.css';

const HotelGalleryManage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    images: [''],
    rating: 4.5,
    amenities: ['Free WiFi', 'Restaurant'],
    rooms: [{ roomNumber: '101', type: 'Standard', price: 150, capacity: 2, status: 'Available' }],
    contactPhone: '',
    contactEmail: ''
  });

  // Use useCallback to memoize fetchHotels - prevents recreation on every render
  const fetchHotels = useCallback(async () => {
    try {
      const { data } = await API.get('/hotels');
      if (data.success) {
        setHotels(data.hotels || []);
      }
    } catch (error) {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency - function never changes

  // Only runs once on mount
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]); // fetchHotels is stable, so only runs once

  useEffect(() => {
    const unsubscribe = onEvent('hotel-updated', () => {
      fetchHotels();
    });

    return () => unsubscribe();
  }, [fetchHotels]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (!formData.name || !formData.location || !formData.description) {
      toast.error('Name, location, and description are required');
      setSubmitting(false);
      return;
    }
    
    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      validImages.push('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80');
    }
    
    const payload = {
      ...formData,
      images: validImages,
      rooms: formData.rooms.filter(room => room.roomNumber && room.price > 0)
    };
    
    try {
      if (editingHotel) {
        await API.put(`/hotels/${editingHotel._id}`, payload);
        toast.success('Hotel updated successfully!');
      } else {
        await API.post('/hotels', payload);
        toast.success('Hotel added successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchHotels(); // Refresh the list
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save hotel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || '',
      location: hotel.location || '',
      description: hotel.description || '',
      images: hotel.images?.length ? hotel.images : [''],
      rating: hotel.rating || 4.5,
      amenities: hotel.amenities?.length ? hotel.amenities : ['Free WiFi', 'Restaurant'],
      rooms: hotel.rooms?.length ? hotel.rooms : [{ roomNumber: '101', type: 'Standard', price: 150, capacity: 2, status: 'Available' }],
      contactPhone: hotel.contactPhone || '',
      contactEmail: hotel.contactEmail || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      try {
        await API.delete(`/hotels/${id}`);
        toast.success('Hotel deleted successfully');
        fetchHotels();
      } catch (error) {
        toast.error('Failed to delete hotel');
      }
    }
  };

  const resetForm = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      images: [''],
      rating: 4.5,
      amenities: ['Free WiFi', 'Restaurant'],
      rooms: [{ roomNumber: '101', type: 'Standard', price: 150, capacity: 2, status: 'Available' }],
      contactPhone: '',
      contactEmail: ''
    });
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, { roomNumber: '', type: 'Standard', price: 100, capacity: 2, status: 'Available' }]
    }));
  };

  const updateRoom = (index, field, value) => {
    setFormData(prev => {
      const updatedRooms = [...prev.rooms];
      updatedRooms[index][field] = value;
      return { ...prev, rooms: updatedRooms };
    });
  };

  const removeRoom = (index) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }));
  };

  const updateAmenity = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.amenities];
      updated[index] = value;
      return { ...prev, amenities: updated };
    });
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const updateImage = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.images];
      updated[index] = value;
      return { ...prev, images: updated };
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading hotels...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h2>Hotel Gallery Management</h2>
          <p className="breadcrumb-text">Add and manage hotels displayed on the guest gallery</p>
        </div>
        <Button className="btn-modern btn-modern-accent" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus className="me-2" /> Add Hotel
        </Button>
      </div>

      {/* Hotels Grid */}
      {hotels.length === 0 ? (
        <div className="text-center py-5">
          <FaHotel size={60} className="text-muted mb-3" />
          <h4>No hotels yet</h4>
          <p>Click "Add Hotel" to create your first hotel listing</p>
        </div>
      ) : (
        <Row className="g-4">
          {hotels.map((hotel, idx) => (
            <Col md={6} lg={4} key={hotel._id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="modern-card hotel-admin-card h-100">
                  <div 
                    className="hotel-card-image" 
                    style={{ 
                      backgroundImage: `url(${hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'})`, 
                      height: '180px', 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center', 
                      borderRadius: '16px 16px 0 0' 
                    }} 
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">{hotel.name}</h5>
                      <Badge bg="warning" className="text-dark">
                        <FaStar className="me-1" />{hotel.rating}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-2">
                      <FaMapMarkerAlt className="me-1" />{hotel.location}
                    </p>
                    <p className="small text-muted mb-3">
                      {hotel.description?.substring(0, 100)}...
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <FaBed className="me-1" />{hotel.rooms?.length || 0} rooms
                      </small>
                      <div>
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(hotel)}>
                          <FaEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(hotel._id)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Hotel Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <h6 className="mb-3">Basic Information</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating (1-5)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="5" 
                    value={formData.rating} 
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.contactPhone} 
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={formData.contactEmail} 
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} 
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Images */}
            <h6 className="mb-3 mt-3"><FaImage className="me-2" />Images</h6>
            {formData.images.map((img, i) => (
              <div key={i} className="d-flex gap-2 mb-2">
                <Form.Control 
                  type="text" 
                  value={img} 
                  onChange={(e) => updateImage(i, e.target.value)} 
                  placeholder="https://images.unsplash.com/photo-..." 
                />
                {formData.images.length > 1 && (
                  <Button variant="outline-danger" size="sm" onClick={() => removeImage(i)}>×</Button>
                )}
              </div>
            ))}
            <Button variant="outline-secondary" size="sm" onClick={addImage} className="mb-3">
              + Add Image URL
            </Button>

            {/* Amenities */}
            <h6 className="mb-3">Amenities</h6>
            {formData.amenities.map((a, i) => (
              <div key={i} className="d-flex gap-2 mb-2">
                <Form.Control 
                  type="text" 
                  value={a} 
                  onChange={(e) => updateAmenity(i, e.target.value)} 
                  placeholder="e.g., Free WiFi" 
                />
                <Button variant="outline-danger" size="sm" onClick={() => removeAmenity(i)}>×</Button>
              </div>
            ))}
            <Button variant="outline-secondary" size="sm" onClick={addAmenity} className="mb-3">
              + Add Amenity
            </Button>

            {/* Rooms */}
            <h6 className="mb-3"><FaBed className="me-2" />Rooms</h6>
            {formData.rooms.map((room, i) => (
              <div key={i} className="border rounded p-3 mb-3 bg-light">
                <Row>
                  <Col md={2}>
                    <Form.Control 
                      size="sm" 
                      placeholder="Room#" 
                      value={room.roomNumber} 
                      onChange={(e) => updateRoom(i, 'roomNumber', e.target.value)} 
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Select 
                      size="sm" 
                      value={room.type} 
                      onChange={(e) => updateRoom(i, 'type', e.target.value)}
                    >
                      <option>Standard</option>
                      <option>Deluxe</option>
                      <option>Suite</option>
                      <option>Presidential</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Control 
                      size="sm" 
                      type="number" 
                      placeholder="Price" 
                      value={room.price} 
                      onChange={(e) => updateRoom(i, 'price', parseFloat(e.target.value))} 
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control 
                      size="sm" 
                      type="number" 
                      placeholder="Capacity" 
                      value={room.capacity} 
                      onChange={(e) => updateRoom(i, 'capacity', parseInt(e.target.value))} 
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Select 
                      size="sm" 
                      value={room.status} 
                      onChange={(e) => updateRoom(i, 'status', e.target.value)}
                    >
                      <option>Available</option>
                      <option>Occupied</option>
                      <option>Reserved</option>
                      <option>Maintenance</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-danger" size="sm" onClick={() => removeRoom(i)}>
                      <FaTimes /> Remove
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button variant="outline-secondary" size="sm" onClick={addRoom} className="mb-3">
              + Add Room
            </Button>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="btn-modern btn-modern-primary" disabled={submitting}>
                <FaSave className="me-2" />
                {submitting ? 'Saving...' : (editingHotel ? 'Update Hotel' : 'Create Hotel')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default HotelGalleryManage;