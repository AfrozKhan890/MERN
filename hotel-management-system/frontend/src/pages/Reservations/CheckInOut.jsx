// frontend/src/pages/Reservations/CheckInOut.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Row, Col, Modal, Form, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaSignOutAlt, FaSearch, FaBed } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';

const CheckInOut = () => {
  const [loading, setLoading] = useState(true);
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [activeTab, setActiveTab] = useState('arrivals');

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/reservations/today');
      if (data.success) {
        setArrivals(data.today.arrivals || []);
        setDepartures(data.today.departures || []);
        setCheckedIn(data.today.checkedIn || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservationId) => {
    try {
      await API.put(`/reservations/${reservationId}/checkin`);
      toast.success('Guest checked in successfully!');
      fetchTodayData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await API.put(`/reservations/${selectedReservation._id}/checkout`, {
        additionalCharges,
        additionalServices,
        paymentMethod: 'Cash'
      });
      toast.success('Guest checked out successfully!');
      setShowCheckOutModal(false);
      setSelectedReservation(null);
      setAdditionalCharges(0);
      setAdditionalServices([]);
      fetchTodayData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const addService = () => {
    setAdditionalServices([...additionalServices, { description: '', amount: 0 }]);
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /><p>Loading...</p></div>;
  }

  return (
    <div>
      <h2 className="mb-4">Check-in / Check-out Management</h2>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="stat-card bg-success text-white" onClick={() => setActiveTab('arrivals')} style={{cursor: 'pointer'}}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Today's Arrivals</h6><h3>{arrivals.length}</h3></div>
                <FaCheckCircle className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card bg-warning text-white" onClick={() => setActiveTab('departures')} style={{cursor: 'pointer'}}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Today's Departures</h6><h3>{departures.length}</h3></div>
                <FaSignOutAlt className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card bg-primary text-white" onClick={() => setActiveTab('checkedin')} style={{cursor: 'pointer'}}>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Currently Checked In</h6><h3>{checkedIn.length}</h3></div>
                <FaBed className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {activeTab === 'arrivals' && (
        <Card>
          <Card.Header><h5>Expected Arrivals Today</h5></Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr><th>Guest</th><th>Room</th><th>Expected</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {arrivals.length > 0 ? arrivals.map(res => (
                  <tr key={res._id}>
                    <td>
                      <strong>{res.guestName}</strong>
                      <br /><small>{res.email}</small>
                    </td>
                    <td>{res.room?.roomNumber} ({res.room?.type})</td>
                    <td>{new Date(res.checkIn).toLocaleString()}</td>
                    <td><Badge bg={res.status === 'Confirmed' ? 'primary' : 'warning'}>{res.status}</Badge></td>
                    <td>
                      {(res.status === 'Confirmed' || res.status === 'Pending') && (
                        <Button variant="success" size="sm" onClick={() => handleCheckIn(res._id)}>
                          <FaCheckCircle className="me-1" /> Check In
                        </Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center">No arrivals today</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'departures' && (
        <Card>
          <Card.Header><h5>Expected Departures Today</h5></Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr><th>Guest</th><th>Room</th><th>Expected</th><th>Action</th></tr>
              </thead>
              <tbody>
                {departures.length > 0 ? departures.map(res => (
                  <tr key={res._id}>
                    <td><strong>{res.guestName}</strong></td>
                    <td>{res.room?.roomNumber}</td>
                    <td>{new Date(res.checkOut).toLocaleString()}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => {
                        setSelectedReservation(res);
                        setShowCheckOutModal(true);
                      }}>
                        <FaSignOutAlt className="me-1" /> Check Out
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center">No departures today</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'checkedin' && (
        <Card>
          <Card.Header><h5>Currently Checked In Guests</h5></Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr><th>Guest</th><th>Room</th><th>Check-in Time</th><th>Expected Departure</th><th>Action</th></tr>
              </thead>
              <tbody>
                {checkedIn.length > 0 ? checkedIn.map(res => (
                  <tr key={res._id}>
                    <td><strong>{res.guestName}</strong></td>
                    <td>{res.room?.roomNumber}</td>
                    <td>{new Date(res.checkIn).toLocaleString()}</td>
                    <td>{new Date(res.checkOut).toLocaleDateString()}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => {
                        setSelectedReservation(res);
                        setShowCheckOutModal(true);
                      }}>
                        <FaSignOutAlt className="me-1" /> Check Out
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center">No guests currently checked in</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Check-out Modal */}
      <Modal show={showCheckOutModal} onHide={() => setShowCheckOutModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Check Out - {selectedReservation?.guestName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Room:</strong> {selectedReservation.room?.roomNumber} ({selectedReservation.room?.type})</p>
                  <p><strong>Check-in:</strong> {new Date(selectedReservation.checkIn).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Room Rate:</strong> ${selectedReservation.room?.price}/night</p>
                  <p><strong>Expected Total:</strong> ${selectedReservation.totalAmount}</p>
                </Col>
              </Row>
              <hr />
              <h6>Additional Charges</h6>
              <Form.Group className="mb-3">
                <Form.Label>Additional Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(e.target.value)}
                  placeholder="e.g., 50"
                />
              </Form.Group>
              <Button variant="outline-secondary" size="sm" onClick={addService} className="mb-3">
                + Add Service
              </Button>
              {additionalServices.map((service, index) => (
                <Row key={index} className="mb-2">
                  <Col md={7}>
                    <Form.Control
                      placeholder="Service description"
                      value={service.description}
                      onChange={(e) => {
                        const updated = [...additionalServices];
                        updated[index].description = e.target.value;
                        setAdditionalServices(updated);
                      }}
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Control
                      type="number"
                      placeholder="Amount"
                      value={service.amount}
                      onChange={(e) => {
                        const updated = [...additionalServices];
                        updated[index].amount = e.target.value;
                        setAdditionalServices(updated);
                      }}
                    />
                  </Col>
                </Row>
              ))}
              <hr />
              <h5 className="text-end">
                Total: ${(selectedReservation.totalAmount + parseFloat(additionalCharges || 0) + 
                  additionalServices.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0)).toFixed(2)}
              </h5>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckOutModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleCheckOut}>
            <FaSignOutAlt className="me-1" /> Complete Check-out
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckInOut;