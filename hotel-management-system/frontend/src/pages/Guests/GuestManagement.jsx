// frontend/src/pages/Guests/GuestManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, Badge,
  Row, Col, InputGroup, Spinner 
} from 'react-bootstrap';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, 
  FaUserPlus, FaStar, FaUser,
  FaEnvelope, FaPhone
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';
import './Guests.css';

const GuestManagement = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Pakistan'
    },
    identification: {
      idType: 'National ID',
      idNumber: ''
    },
    preferences: {
      roomType: '',
      smoking: false
    },
    vipStatus: false,
    notes: ''
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/guests');
      if (data.success) {
        setGuests(data.guests || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (selectedGuest) {
        await API.put(`/guests/${selectedGuest._id}`, formData);
        toast.success('Guest updated successfully');
      } else {
        await API.post('/guests', formData);
        toast.success('Guest added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchGuests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save guest');
    }
  };

  const handleEdit = (guest) => {
    setSelectedGuest(guest);
    setFormData({
      firstName: guest.firstName || '',
      lastName: guest.lastName || '',
      email: guest.email || '',
      phone: guest.phone || '',
      address: guest.address || { street: '', city: '', state: '', country: 'Pakistan' },
      identification: guest.identification || { idType: 'National ID', idNumber: '' },
      preferences: guest.preferences || { roomType: '', smoking: false },
      vipStatus: guest.vipStatus || false,
      notes: guest.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this guest?')) {
      try {
        await API.delete(`/guests/${id}`);
        toast.success('Guest deactivated');
        fetchGuests();
      } catch (error) {
        toast.error('Failed to delete guest');
      }
    }
  };

  const resetForm = () => {
    setSelectedGuest(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      address: { street: '', city: '', state: '', country: 'Pakistan' },
      identification: { idType: 'National ID', idNumber: '' },
      preferences: { roomType: '', smoking: false },
      vipStatus: false, notes: ''
    });
  };

  const filteredGuests = guests.filter(guest => {
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading guests...</p>
      </div>
    );
  }

  return (
    <div className="guests-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Guest Management</h2>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaUserPlus className="me-2" /> Add New Guest
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <h6>Total Guests</h6>
              <h3>{stats.total || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <h6>Active</h6>
              <h3>{stats.active || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <h6>VIP Guests</h6>
              <h3>{stats.vip || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <h6>New This Month</h6>
              <h3>{stats.newThisMonth || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search guests by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactive</option>
                <option value="Blacklisted">Blacklisted</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Guests Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Contact</th>
                <th>Stays</th>
                <th>Status</th>
                <th>VIP</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length > 0 ? filteredGuests.map(guest => (
                <tr key={guest._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="guest-avatar me-2">
                        {guest.firstName?.charAt(0)}{guest.lastName?.charAt(0)}
                      </div>
                      <div>
                        <strong>{guest.firstName} {guest.lastName}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div><FaEnvelope className="me-1" size={12} />{guest.email}</div>
                    <div><FaPhone className="me-1" size={12} />{guest.phone}</div>
                  </td>
                  <td>{guest.totalStays || 0}</td>
                  <td>
                    <Badge bg={guest.status === 'Active' ? 'success' : guest.status === 'Blacklisted' ? 'danger' : 'secondary'}>
                      {guest.status}
                    </Badge>
                  </td>
                  <td>
                    {guest.vipStatus ? <FaStar className="text-warning" /> : '-'}
                  </td>
                  <td><small>{new Date(guest.createdAt).toLocaleDateString()}</small></td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(guest)}>
                      <FaEdit />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(guest._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center">No guests found</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Guest Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedGuest ? 'Edit Guest' : 'Add New Guest'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="VIP Guest"
                    checked={formData.vipStatus}
                    onChange={(e) => setFormData({...formData, vipStatus: e.target.checked})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Type</Form.Label>
                  <Form.Select
                    value={formData.identification.idType}
                    onChange={(e) => setFormData({
                      ...formData,
                      identification: {...formData.identification, idType: e.target.value}
                    })}
                  >
                    <option value="National ID">National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any special notes about this guest..."
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">
                {selectedGuest ? 'Update Guest' : 'Add Guest'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GuestManagement;