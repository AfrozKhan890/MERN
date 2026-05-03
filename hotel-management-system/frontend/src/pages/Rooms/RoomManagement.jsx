// frontend/src/pages/Rooms/RoomManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Modal, 
  Form 
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';
import './Rooms.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Standard',
    floor: '',
    price: '',
    capacity: 2,
    status: 'Available'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await API.get('/rooms');
      if (data.success) {
        setRooms(data.rooms || data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      floor: room.floor,
      price: room.price,
      capacity: room.capacity,
      status: room.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await API.delete(`/rooms/${id}`);
        toast.success('Room deleted successfully');
        fetchRooms();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedRoom) {
        await API.put(`/rooms/${selectedRoom._id}`, formData);
        toast.success('Room updated successfully');
      } else {
        await API.post('/rooms', formData);
        toast.success('Room added successfully');
      }
      setShowModal(false);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Available': 'success',
      'Occupied': 'primary',
      'Cleaning': 'warning',
      'Maintenance': 'danger',
      'Reserved': 'info'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber?.includes(searchTerm) || 
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || room.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="text-center mt-5"><h4>Loading rooms...</h4></div>;
  }

  return (
    <div className="rooms-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Room Management</h2>
        <Button variant="primary" onClick={() => {
          setSelectedRoom(null);
          setFormData({
            roomNumber: '',
            type: 'Standard',
            floor: '',
            price: '',
            capacity: 2,
            status: 'Available'
          });
          setShowModal(true);
        }}>
          <FaPlus className="me-2" /> Add New Room
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="search-box">
                <FaSearch className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={6}>
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Rooms</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Room Stats */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="text-center room-stat-card bg-success text-white">
            <Card.Body>
              <h6>Available</h6>
              <h3>{rooms.filter(r => r.status === 'Available').length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center room-stat-card bg-primary text-white">
            <Card.Body>
              <h6>Occupied</h6>
              <h3>{rooms.filter(r => r.status === 'Occupied').length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center room-stat-card bg-warning text-white">
            <Card.Body>
              <h6>Cleaning</h6>
              <h3>{rooms.filter(r => r.status === 'Cleaning').length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center room-stat-card bg-danger text-white">
            <Card.Body>
              <h6>Maintenance</h6>
              <h3>{rooms.filter(r => r.status === 'Maintenance').length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rooms Grid */}
      <Row className="g-4">
        {filteredRooms.map(room => (
          <Col md={4} key={room._id || room.id}>
            <Card className="room-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Room {room.roomNumber}</h5>
                {getStatusBadge(room.status)}
              </Card.Header>
              <Card.Body>
                <div className="room-info">
                  <p><strong>Type:</strong> {room.type}</p>
                  <p><strong>Floor:</strong> {room.floor}</p>
                  <p><strong>Price:</strong> ${room.price}/night</p>
                  <p><strong>Capacity:</strong> {room.capacity} persons</p>
                  {room.amenities && room.amenities.length > 0 && (
                    <>
                      <p><strong>Amenities:</strong></p>
                      <div className="amenities-list">
                        {room.amenities.map((amenity, index) => (
                          <Badge bg="light" text="dark" className="me-1" key={index}>
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleEdit(room)}
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDelete(room._id || room.id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Room Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedRoom ? 'Edit Room' : 'Add New Room'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Room Number</Form.Label>
              <Form.Control 
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Room Type</Form.Label>
              <Form.Select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Suite</option>
                <option>Presidential</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Floor</Form.Label>
              <Form.Control 
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({...formData, floor: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option>Available</option>
                <option>Occupied</option>
                <option>Cleaning</option>
                <option>Maintenance</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price per Night ($)</Form.Label>
              <Form.Control 
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control 
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {selectedRoom ? 'Update Room' : 'Add Room'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RoomManagement;