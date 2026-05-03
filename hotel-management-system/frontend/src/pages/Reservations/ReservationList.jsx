// src/pages/Reservations/ReservationList.js
import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, Modal } from 'react-bootstrap';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Reservations.css';

const ReservationList = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([
    {
      id: 1,
      guest: 'John Smith',
      email: 'john@email.com',
      room: '301',
      type: 'Deluxe',
      checkIn: '2024-01-20',
      checkOut: '2024-01-25',
      guests: 2,
      status: 'Confirmed',
      amount: 1000,
      paymentStatus: 'Paid'
    },
    {
      id: 2,
      guest: 'Sarah Johnson',
      email: 'sarah@email.com',
      room: '205',
      type: 'Standard',
      checkIn: '2024-01-21',
      checkOut: '2024-01-23',
      guests: 1,
      status: 'Checked In',
      amount: 200,
      paymentStatus: 'Paid'
    },
    {
      id: 3,
      guest: 'Mike Brown',
      email: 'mike@email.com',
      room: '402',
      type: 'Suite',
      checkIn: '2024-01-22',
      checkOut: '2024-01-24',
      guests: 3,
      status: 'Pending',
      amount: 1000,
      paymentStatus: 'Pending'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const getStatusBadge = (status) => {
    const variants = {
      'Confirmed': 'primary',
      'Checked In': 'success',
      'Checked Out': 'secondary',
      'Pending': 'warning',
      'Cancelled': 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const getPaymentBadge = (status) => {
    const variants = {
      'Paid': 'success',
      'Pending': 'warning',
      'Refunded': 'info'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetails(true);
  };

  const handleCancelReservation = (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      setReservations(reservations.map(res => 
        res.id === id ? { ...res, status: 'Cancelled' } : res
      ));
      toast.success('Reservation cancelled successfully');
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         res.room.includes(searchTerm) ||
                         res.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="reservations-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reservations</h2>
        <Button variant="primary" onClick={() => navigate('/reservations/create')}>
          <FaPlus className="me-2" /> New Reservation
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
                  placeholder="Search reservations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={6}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Reservations Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>#{reservation.id}</td>
                  <td>
                    <div>
                      <strong>{reservation.guest}</strong>
                      <br />
                      <small className="text-muted">{reservation.email}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      {reservation.room}
                      <br />
                      <small className="text-muted">{reservation.type}</small>
                    </div>
                  </td>
                  <td><small>{reservation.checkIn}</small></td>
                  <td><small>{reservation.checkOut}</small></td>
                  <td>{getStatusBadge(reservation.status)}</td>
                  <td>${reservation.amount}</td>
                  <td>{getPaymentBadge(reservation.paymentStatus)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        onClick={() => handleViewDetails(reservation)}
                        title="View Details"
                      >
                        <FaEye />
                      </Button>
                      {reservation.status !== 'Checked Out' && reservation.status !== 'Cancelled' && (
                        <>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => navigate('/reservations/create')}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCancelReservation(reservation.id)}
                            title="Cancel"
                          >
                            <FaTrash />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reservation Details - #{selectedReservation?.id}</Modal.Title>
        </Modal.Header>
        {selectedReservation && (
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6>Guest Information</h6>
                <p><strong>Name:</strong> {selectedReservation.guest}</p>
                <p><strong>Email:</strong> {selectedReservation.email}</p>
                <p><strong>Guests:</strong> {selectedReservation.guests}</p>
              </Col>
              <Col md={6}>
                <h6>Room Information</h6>
                <p><strong>Room Number:</strong> {selectedReservation.room}</p>
                <p><strong>Room Type:</strong> {selectedReservation.type}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedReservation.status)}</p>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md={6}>
                <h6>Stay Details</h6>
                <p><strong>Check-in:</strong> {selectedReservation.checkIn}</p>
                <p><strong>Check-out:</strong> {selectedReservation.checkOut}</p>
              </Col>
              <Col md={6}>
                <h6>Payment Information</h6>
                <p><strong>Amount:</strong> ${selectedReservation.amount}</p>
                <p><strong>Payment Status:</strong> {getPaymentBadge(selectedReservation.paymentStatus)}</p>
              </Col>
            </Row>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          {selectedReservation?.status === 'Confirmed' && (
            <Button variant="success">
              <FaCheckCircle className="me-2" /> Check In
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReservationList;