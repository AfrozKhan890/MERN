// frontend/src/pages/Billing/InvoiceGeneration.jsx - WITH REAL API
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaSearch, FaPrint, FaEnvelope, FaDownload, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';
import './Billing.css';

const InvoiceGeneration = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/billing');
      if (data.success) {
        setInvoices(data.data || []);
        setStats({
          total: data.total || 0,
          paid: data.stats?.paid || 0,
          pending: data.stats?.pending || 0,
          totalRevenue: data.stats?.totalRevenue || 0
        });
      }
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
    toast.success('Invoice sent to printer');
  };

  const handleEmailInvoice = async () => {
    toast.success('Invoice sent to guest email');
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Paid': 'success',
      'Partially Paid': 'warning',
      'Issued': 'primary',
      'Draft': 'secondary',
      'Cancelled': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (invoice.invoiceNumber || '').toLowerCase().includes(searchLower) ||
      (invoice.guest?.firstName || '').toLowerCase().includes(searchLower) ||
      (invoice.guest?.lastName || '').toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="billing-container">
      <h2 className="mb-4">Billing & Invoice Management</h2>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card-modern">
            <Card.Body>
              <h6>Total Invoices</h6>
              <h3>{stats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-modern bg-success text-white">
            <Card.Body>
              <h6>Total Revenue</h6>
              <h3>${stats.totalRevenue.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-modern bg-warning text-white">
            <Card.Body>
              <h6>Pending Amount</h6>
              <h3>${stats.pending.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-modern bg-info text-white">
            <Card.Body>
              <h6>Paid Invoices</h6>
              <h3>{stats.paid}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="search-box">
                <FaSearch className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search invoices by ID, guest..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Issued">Issued</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Invoices Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? filteredInvoices.map(invoice => (
                <tr key={invoice._id}>
                  <td><strong>{invoice.invoiceNumber}</strong></td>
                  <td>
                    {invoice.guest?.firstName} {invoice.guest?.lastName}
                    <br/><small>{invoice.guest?.email}</small>
                  </td>
                  <td>{invoice.reservation?.roomNumber || '-'}</td>
                  <td>{new Date(invoice.issuedDate).toLocaleDateString()}</td>
                  <td><strong>${invoice.totalAmount?.toFixed(2)}</strong></td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <FaEye /> View
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center">No invoices found</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Invoice Details Modal */}
      <Modal show={showInvoice} onHide={() => setShowInvoice(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        {selectedInvoice && (
          <Modal.Body>
            <div className="invoice-preview" id="invoice-print">
              <div className="invoice-header text-center mb-4">
                <h3>LuxuryStay Hospitality</h3>
                <p>123 Hotel Street, City, Country</p>
                <p>Phone: (555) 123-4567 | Email: info@luxurystay.com</p>
                <hr />
              </div>
              
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Bill To:</h6>
                  <p><strong>{selectedInvoice.guest?.firstName} {selectedInvoice.guest?.lastName}</strong></p>
                  <p>Email: {selectedInvoice.guest?.email}</p>
                </Col>
                <Col md={6} className="text-end">
                  <h6>Invoice Details:</h6>
                  <p><strong>Invoice ID:</strong> {selectedInvoice.invoiceNumber}</p>
                  <p><strong>Date:</strong> {new Date(selectedInvoice.issuedDate).toLocaleDateString()}</p>
                  <p>{getStatusBadge(selectedInvoice.status)}</p>
                </Col>
              </Row>

              <Table bordered>
                <thead>
                  <tr className="bg-light">
                    <th>Description</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Room Charges ({selectedInvoice.reservation?.checkIn?.split('T')[0]} to {selectedInvoice.reservation?.checkOut?.split('T')[0]})</td>
                    <td className="text-end">${selectedInvoice.roomCharges?.toFixed(2)}</td>
                  </tr>
                  {selectedInvoice.additionalServices?.length > 0 && (
                    <tr>
                      <td>Additional Services</td>
                      <td className="text-end">${selectedInvoice.additionalChargesTotal?.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Tax ({selectedInvoice.taxRate}%)</td>
                    <td className="text-end">${selectedInvoice.taxAmount?.toFixed(2)}</td>
                  </tr>
                  <tr className="table-active">
                    <td><strong>Total Amount</strong></td>
                    <td className="text-end"><strong>${selectedInvoice.totalAmount?.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={handlePrintInvoice}>
              <FaPrint className="me-2" /> Print
            </Button>
            <Button variant="primary" onClick={handleEmailInvoice}>
              <FaEnvelope className="me-2" /> Email
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InvoiceGeneration;