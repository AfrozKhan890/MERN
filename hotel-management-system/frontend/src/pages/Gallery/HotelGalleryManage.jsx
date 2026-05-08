// frontend/src/pages/Gallery/HotelGalleryManage.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Table, Badge, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaHotel, FaStar, FaMapMarkerAlt, FaBed, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';
import './HotelGalleryManage.css';

const HotelGalleryManage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
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

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const { data } = await API.get('/hotels');
      if (data.success) setHotels(data.hotels || []);
    } catch (error) {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHotel) {
        await API.put(`/hotels/${editingHotel._id}`, formData);
        toast.success('Hotel updated!');
      } else {
        await API.post('/hotels', formData);
        toast.success('Hotel added!');
      }
      setShowModal(false);
      resetForm();
      fetchHotels();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      images: hotel.images || [''],
      rating: hotel.rating,
      amenities: hotel.amenities || [],
      rooms: hotel.rooms || [],
      contactPhone: hotel.contactPhone || '',
      contactEmail: hotel.contactEmail || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this hotel?')) {
      try {
        await API.delete(`/hotels/${id}`);
        toast.success('Hotel deleted');
        fetchHotels();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setEditingHotel(null);
    setFormData({
      name: '', location: '', description: '', images: [''], rating: 4.5,
      amenities: ['Free WiFi', 'Restaurant'],
      rooms: [{ roomNumber: '101', type: 'Standard', price: 150, capacity: 2, status: 'Available' }],
      contactPhone: '', contactEmail: ''
    });
  };

  const addRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, { roomNumber: '', type: 'Standard', price: 100, capacity: 2, status: 'Available' }]
    });
  };

  const updateRoom = (index, field, value) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index][field] = value;
    setFormData({ ...formData, rooms: updatedRooms });
  };

  const removeRoom = (index) => {
    setFormData({ ...formData, rooms: formData.rooms.filter((_, i) => i !== index) });
  };

  const addAmenity = () => {
    setFormData({ ...formData, amenities: [...formData.amenities, ''] });
  };

  const updateAmenity = (index, value) => {
    const updated = [...formData.amenities];
    updated[index] = value;
    setFormData({ ...formData, amenities: updated });
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /><p>Loading...</p></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="page-header">
        <div>
          <h2>Hotel Gallery Management</h2>
          <p className="breadcrumb-text">Add and manage hotels displayed on the guest gallery</p>
        </div>
        <Button className="btn-modern btn-modern-accent" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus className="me-2" /> Add Hotel
        </Button>
      </div>

      {/* Hotels Grid */}
      <Row className="g-4">
        {hotels.map((hotel, idx) => (
          <Col md={6} lg={4} key={hotel._id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="modern-card hotel-admin-card">
                <div className="hotel-card-image" style={{ backgroundImage: `url(${hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'})`, height: '180px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px 16px 0 0' }} />
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{hotel.name}</h5>
                    <Badge bg="warning"><FaStar className="me-1" />{hotel.rating}</Badge>
                  </div>
                  <p className="text-muted small mb-2"><FaMapMarkerAlt className="me-1" />{hotel.location}</p>
                  <p className="small text-muted mb-3">{hotel.description?.substring(0, 100)}...</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted"><FaBed className="me-1" />{hotel.rooms?.length || 0} rooms</small>
                    <div>
                      <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(hotel)}><FaEdit /></Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(hotel._id)}><FaTrash /></Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
        {hotels.length === 0 && (
          <Col xs={12}>
            <div className="text-center py-5 text-muted">
              <FaHotel size={48} className="mb-3" />
              <h5>No hotels added yet</h5>
              <p>Click "Add Hotel" to start building your gallery</p>
            </div>
          </Col>
        )}
      </Row>

      {/* Add/Edit Hotel Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Name *</Form.Label>
                  <Form.Control type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URLs (first is main image)</Form.Label>
              {formData.images.map((img, i) => (
                <div key={i} className="d-flex gap-2 mb-2">
                  <Form.Control type="text" value={img} onChange={(e) => { const imgs = [...formData.images]; imgs[i] = e.target.value; setFormData({...formData, images: imgs}); }} placeholder="https://images.unsplash.com/photo-..." />
                  {formData.images.length > 1 && <Button variant="outline-danger" size="sm" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}>×</Button>}
                </div>
              ))}
              <Button variant="outline-secondary" size="sm" onClick={() => setFormData({...formData, images: [...formData.images, '']})}>+ Add Image URL</Button>
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Control type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            {/* Amenities */}
            <Form.Group className="mb-3">
              <Form.Label>Amenities</Form.Label>
              {formData.amenities.map((a, i) => (
                <div key={i} className="d-flex gap-2 mb-2">
                  <Form.Control type="text" value={a} onChange={(e) => updateAmenity(i, e.target.value)} placeholder="e.g., Free WiFi" />
                  <Button variant="outline-danger" size="sm" onClick={() => setFormData({...formData, amenities: formData.amenities.filter((_, idx) => idx !== i)})}>×</Button>
                </div>
              ))}
              <Button variant="outline-secondary" size="sm" onClick={addAmenity}>+ Add Amenity</Button>
            </Form.Group>

            {/* Rooms */}
            <Form.Group className="mb-3">
              <Form.Label>Rooms</Form.Label>
              {formData.rooms.map((room, i) => (
                <div key={i} className="border rounded p-3 mb-2 bg-light">
                  <Row>
                    <Col md={2}><Form.Control size="sm" placeholder="Room#" value={room.roomNumber} onChange={(e) => updateRoom(i, 'roomNumber', e.target.value)} /></Col>
                    <Col md={2}>
                      <Form.Select size="sm" value={room.type} onChange={(e) => updateRoom(i, 'type', e.target.value)}>
                        <option>Standard</option><option>Deluxe</option><option>Suite</option><option>Presidential</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}><Form.Control size="sm" type="number" placeholder="Price" value={room.price} onChange={(e) => updateRoom(i, 'price', e.target.value)} /></Col>
                    <Col md={2}><Form.Control size="sm" type="number" placeholder="Capacity" value={room.capacity} onChange={(e) => updateRoom(i, 'capacity', e.target.value)} /></Col>
                    <Col md={2}>
                      <Form.Select size="sm" value={room.status} onChange={(e) => updateRoom(i, 'status', e.target.value)}>
                        <option>Available</option><option>Occupied</option><option>Reserved</option><option>Maintenance</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}><Button variant="outline-danger" size="sm" onClick={() => removeRoom(i)}>×</Button></Col>
                  </Row>
                </div>
              ))}
              <Button variant="outline-secondary" size="sm" onClick={addRoom}>+ Add Room</Button>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="btn-modern btn-modern-primary" type="submit">{editingHotel ? 'Update Hotel' : 'Create Hotel'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default HotelGalleryManage;