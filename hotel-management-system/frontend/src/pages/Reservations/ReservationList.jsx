// frontend/src/pages/Reservations/ReservationList.jsx - FIXED with API
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';
import './Reservations.css';

const ReservationList = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editForm, setEditForm] = useState({
    guestName: '', email: '', phone: '', roomNumber: '', checkIn: '', checkOut: '', adults: 1, children: 0, status: '', paymentStatus: ''
  });

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await API.get('/reservations');
      setReservations(data.data || data.reservations || []);
    } catch (error) {
      console.error('Reservations API Error:', error.response?.data || error.message);
      if (loading) toast.error('Failed to load reservations');
    }
    finally { setLoading(false); }
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setEditForm({
      guestName: reservation.guestName || '',
      email: reservation.email || '',
      phone: reservation.phone || '',
      roomNumber: reservation.roomNumber || '',
      checkIn: reservation.checkIn ? new Date(reservation.checkIn).toISOString().split('T')[0] : '',
      checkOut: reservation.checkOut ? new Date(reservation.checkOut).toISOString().split('T')[0] : '',
      adults: reservation.adults || 1,
      children: reservation.children || 0,
      status: reservation.status || 'Pending',
      paymentStatus: reservation.paymentStatus || 'Pending'
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/reservations/${selectedReservation._id}`, editForm);
      toast.success('Reservation updated!');
      setShowEditModal(false);
      fetchReservations();
    } catch (error) { toast.error('Failed to update'); }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this reservation?')) {
      try {
        await API.delete(`/reservations/${id}`);
        toast.success('Cancelled');
        fetchReservations();
      } catch (error) { toast.error('Failed to cancel'); }
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await API.put(`/reservations/${id}/checkin`);
      toast.success('Checked in!');
      fetchReservations();
    } catch (error) { toast.error('Check-in failed'); }
  };

  const getStatusBadge = (status) => {
    const v = { 'Confirmed': 'primary', 'Checked In': 'success', 'Checked Out': 'secondary', 'Pending': 'warning', 'Cancelled': 'danger' };
    return <Badge className="badge-modern" bg={v[status] || 'secondary'}>{status}</Badge>;
  };

  const filtered = reservations.filter(r => {
    const s = searchTerm.toLowerCase();
    return (r.guestName?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s) || r.roomNumber?.includes(s)) &&
      (statusFilter === 'all' || r.status === statusFilter);
  });

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /><p>Loading...</p></div>;

  return (
    <div className="reservations-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reservations</h2>
        <Button variant="primary" onClick={() => navigate('/reservations/create')}><FaPlus className="me-2" />New Reservation</Button>
      </div>
      <Card className="mb-4"><Card.Body><Row>
        <Col md={6}><div className="search-box"><FaSearch className="search-icon" /><Form.Control type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></Col>
        <Col md={6}><Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All</option><option>Confirmed</option><option>Checked In</option><option>Checked Out</option><option>Pending</option><option>Cancelled</option></Form.Select></Col>
      </Row></Card.Body></Card>
      <Card><Card.Body>
        <Table responsive hover className="modern-table mb-0"><thead><tr><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead><tbody>
          {filtered.length > 0 ? filtered.map(r => (
            <tr key={r._id}>
              <td><strong>{r.guestName}</strong><br/><small>{r.email}</small></td>
              <td>{r.roomNumber}</td>
              <td>{new Date(r.checkIn).toLocaleDateString()}</td>
              <td>{new Date(r.checkOut).toLocaleDateString()}</td>
              <td>{getStatusBadge(r.status)}</td>
              <td>${r.totalAmount}</td>
              <td>
                <Button variant="outline-info" size="sm" className="me-1" onClick={() => { setSelectedReservation(r); setShowDetails(true); }}><FaEye /></Button>
                {r.status !== 'Checked Out' && r.status !== 'Cancelled' && <>
                  <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(r)}><FaEdit /></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleCancel(r._id)}><FaTrash /></Button>
                </>}
                {(r.status === 'Confirmed' || r.status === 'Pending') && <Button variant="success" size="sm" className="ms-1" onClick={() => handleCheckIn(r._id)}><FaCheckCircle /></Button>}
              </td>
            </tr>
          )) : <tr><td colSpan="7" className="text-center py-4">No reservations found</td></tr>}
        </tbody></Table>
      </Card.Body></Card>

      {/* Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered><Modal.Header closeButton><Modal.Title>Reservation Details</Modal.Title></Modal.Header>
        {selectedReservation && <Modal.Body><Row><Col md={6}><h6>Guest</h6><p>{selectedReservation.guestName}<br/>{selectedReservation.email}<br/>{selectedReservation.phone}</p></Col><Col md={6}><h6>Room</h6><p>Room {selectedReservation.roomNumber}<br/>Adults: {selectedReservation.adults}<br/>Children: {selectedReservation.children}</p></Col></Row><hr/><Row><Col md={6}><h6>Stay</h6><p>Check-in: {new Date(selectedReservation.checkIn).toLocaleDateString()}<br/>Check-out: {new Date(selectedReservation.checkOut).toLocaleDateString()}</p></Col><Col md={6}><h6>Payment</h6><p>Amount: ${selectedReservation.totalAmount}<br/>Status: {getStatusBadge(selectedReservation.paymentStatus)}</p></Col></Row></Modal.Body>}
      </Modal>

      {/* Edit Modal - Pre-filled with existing data */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Edit Reservation</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Guest Name</Form.Label><Form.Control type="text" value={editForm.guestName} onChange={e => setEditForm({...editForm, guestName: e.target.value})} required /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Phone</Form.Label><Form.Control type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Room Number</Form.Label><Form.Control type="text" value={editForm.roomNumber} onChange={e => setEditForm({...editForm, roomNumber: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}><option>Pending</option><option>Confirmed</option><option>Checked In</option><option>Checked Out</option></Form.Select></Form.Group></Col>
            </Row>
            <Row>
              <Col md={3}><Form.Group className="mb-3"><Form.Label>Check In</Form.Label><Form.Control type="date" value={editForm.checkIn} onChange={e => setEditForm({...editForm, checkIn: e.target.value})} /></Form.Group></Col>
              <Col md={3}><Form.Group className="mb-3"><Form.Label>Check Out</Form.Label><Form.Control type="date" value={editForm.checkOut} onChange={e => setEditForm({...editForm, checkOut: e.target.value})} /></Form.Group></Col>
              <Col md={3}><Form.Group className="mb-3"><Form.Label>Adults</Form.Label><Form.Control type="number" min="1" value={editForm.adults} onChange={e => setEditForm({...editForm, adults: e.target.value})} /></Form.Group></Col>
              <Col md={3}><Form.Group className="mb-3"><Form.Label>Children</Form.Label><Form.Control type="number" min="0" value={editForm.children} onChange={e => setEditForm({...editForm, children: e.target.value})} /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Payment Status</Form.Label><Form.Select value={editForm.paymentStatus} onChange={e => setEditForm({...editForm, paymentStatus: e.target.value})}><option>Pending</option><option>Paid</option><option>Partially Paid</option></Form.Select></Form.Group>
            <div className="d-flex justify-content-end gap-2"><Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button><Button variant="primary" type="submit">Update Reservation</Button></div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ReservationList;
