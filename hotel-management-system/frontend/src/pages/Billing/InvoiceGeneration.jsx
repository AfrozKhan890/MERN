// src/pages/Billing/InvoiceGeneration.js
import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, Modal } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaSearch, FaPrint, FaEnvelope, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Billing.css';

const InvoiceGeneration = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      guest: 'John Smith',
      room: '301',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      roomCharges: 500,
      additionalServices: 150,
      taxes: 97.5,
      total: 747.5,
      status: 'Paid',
      issuedDate: '2024-01-20'
    },
    {
      id: 'INV-002',
      guest: 'Sarah Johnson',
      room: '205',
      checkIn: '2024-01-16',
      checkOut: '2024-01-18',
      roomCharges: 400,
      additionalServices: 200,
      taxes: 90,
      total: 690,
      status: 'Pending',
      issuedDate: '2024-01-18'
    },
    {
      id: 'INV-003',
      guest: 'Mike Brown',
      room: '402',
      checkIn: '2024-01-17',
      checkOut: '2024-01-19',
      roomCharges: 1000,
      additionalServices: 300,
      taxes: 195,
      total: 1495,
      status: 'Paid',
      issuedDate: '2024-01-19'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const getStatusBadge = (status) => {
    return <Badge bg={status === 'Paid' ? 'success' : 'warning'}>{status}</Badge>;
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
    toast.success('Invoice sent to printer');
  };

  const handleEmailInvoice = () => {
    toast.success('Invoice sent to guest email');
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice downloaded successfully');
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.id.toLowerCase().includes(searchLower) ||
      invoice.guest.toLowerCase().includes(searchLower) ||
      invoice.room.includes(searchTerm)
    );
  });

  return (
    <div className="billing-container">
      <h2 className="mb-4">Billing & Invoice Management</h2>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="billing-stat-card bg-primary text-white">
            <Card.Body>
              <h6>Total Invoices</h6>
              <h3>{invoices.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="billing-stat-card bg-success text-white">
            <Card.Body>
              <h6>Total Revenue</h6>
              <h3>${totalRevenue.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="billing-stat-card bg-warning text-white">
            <Card.Body>
              <h6>Pending Amount</h6>
              <h3>${pendingAmount.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="billing-stat-card bg-info text-white">
            <Card.Body>
              <h6>Paid Invoices</h6>
              <h3>{invoices.filter(inv => inv.status === 'Paid').length}</h3>
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
                  placeholder="Search invoices by ID, guest, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Room Charges</th>
                <th>Services</th>
                <th>Taxes</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td><strong>{invoice.id}</strong></td>
                  <td>{invoice.guest}</td>
                  <td>{invoice.room}</td>
                  <td><small>{invoice.checkIn}</small></td>
                  <td><small>{invoice.checkOut}</small></td>
                  <td>${invoice.roomCharges}</td>
                  <td>${invoice.additionalServices}</td>
                  <td>${invoice.taxes}</td>
                  <td><strong>${invoice.total}</strong></td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <FaFileInvoiceDollar /> View
                    </Button>
                  </td>
                </tr>
              ))}
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
            <div className="invoice-preview">
              <div className="invoice-header text-center mb-4">
                <h3>LuxuryStay Hospitality</h3>
                <p>123 Hotel Street, City, Country</p>
                <p>Phone: (555) 123-4567 | Email: info@luxurystay.com</p>
                <hr />
              </div>
              
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Bill To:</h6>
                  <p><strong>{selectedInvoice.guest}</strong></p>
                  <p>Room: {selectedInvoice.room}</p>
                </Col>
                <Col md={6} className="text-end">
                  <h6>Invoice Details:</h6>
                  <p><strong>Invoice ID:</strong> {selectedInvoice.id}</p>
                  <p><strong>Date:</strong> {selectedInvoice.issuedDate}</p>
                  <p>{getStatusBadge(selectedInvoice.status)}</p>
                </Col>
              </Row>

              <Table bordered>
                <thead>
                  <tr className="bg-light">
                    <th>Description</th>
                    <th>Details</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Room Charges</td>
                    <td>
                      {selectedInvoice.checkIn} to {selectedInvoice.checkOut}
                      <br />
                      <small className="text-muted">
                        {new Date(selectedInvoice.checkOut).getDate() - 
                         new Date(selectedInvoice.checkIn).getDate()} nights
                      </small>
                    </td>
                    <td className="text-end">${selectedInvoice.roomCharges.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Additional Services</td>
                    <td>
                      Room Service, Laundry, etc.
                    </td>
                    <td className="text-end">${selectedInvoice.additionalServices.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Taxes (15%)</td>
                    <td>GST & Service Tax</td>
                    <td className="text-end">${selectedInvoice.taxes.toFixed(2)}</td>
                  </tr>
                  <tr className="table-active">
                    <td colSpan="2"><strong>Total Amount</strong></td>
                    <td className="text-end"><strong>${selectedInvoice.total.toFixed(2)}</strong></td>
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
            <Button variant="success" onClick={handleDownloadInvoice}>
              <FaDownload className="me-2" /> Download
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InvoiceGeneration;