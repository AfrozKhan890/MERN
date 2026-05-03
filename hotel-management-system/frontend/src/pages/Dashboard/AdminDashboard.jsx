// frontend/src/pages/Dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { 
  FaHotel, 
  FaUsers, 
  FaCalendarCheck, 
  FaDollarSign,
  FaBed,
  FaBroom,
  FaTools
} from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [roomDistribution, setRoomDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await API.get('/dashboard/admin');
      if (data.success) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
        setRoomDistribution(data.roomStatusDistribution || []);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  const revenueData = {
    labels: ['Today', 'This Week', 'This Month'],
    datasets: [
      {
        label: 'Revenue',
        data: [
          stats?.todayRevenue || 0,
          (stats?.monthlyRevenue || 0) / 4,
          stats?.monthlyRevenue || 0
        ],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  const roomDistributionData = {
    labels: roomDistribution.map(r => r._id || 'Unknown'),
    datasets: [
      {
        data: roomDistribution.map(r => r.count || 0),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }
    ]
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Checked In': 'success',
      'Confirmed': 'primary',
      'Pending': 'warning',
      'Cancelled': 'danger',
      'Checked Out': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Total Rooms</h6>
                  <h3>{stats?.totalRooms || 0}</h3>
                </div>
                <FaHotel className="stat-icon" />
              </div>
              <small>{stats?.availableRooms || 0} Available</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Occupancy Rate</h6>
                  <h3>{stats?.occupancyRate || 0}%</h3>
                </div>
                <FaBed className="stat-icon" />
              </div>
              <small>{stats?.occupiedRooms || 0} Occupied</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Today's Check-ins</h6>
                  <h3>{stats?.todayCheckins || 0}</h3>
                </div>
                <FaCalendarCheck className="stat-icon" />
              </div>
              <small>{stats?.todayCheckouts || 0} Check-outs</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Active Staff</h6>
                  <h3>{stats?.activeStaff || 0}</h3>
                </div>
                <FaUsers className="stat-icon" />
              </div>
              <small>{stats?.totalUsers || 0} Total Users</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Revenue Overview</h5>
            </Card.Header>
            <Card.Body>
              <Line data={revenueData} options={{ responsive: true }} height={300} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Room Distribution</h5>
            </Card.Header>
            <Card.Body>
              <Pie data={roomDistributionData} options={{ responsive: true }} height={300} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Recent Bookings</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? recentBookings.map((booking, index) => (
                    <tr key={booking._id || index}>
                      <td>{booking.guestName || 'N/A'}</td>
                      <td>{booking.room?.roomNumber || 'N/A'}</td>
                      <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center">No recent bookings</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5>Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6><FaTools className="me-2" />Maintenance Rooms</h6>
                <h4 className="text-danger">{stats?.maintenanceRooms || 0}</h4>
              </div>
              <div className="mb-3">
                <h6><FaBroom className="me-2" />Cleaning Rooms</h6>
                <h4 className="text-warning">{stats?.cleaningRooms || 0}</h4>
              </div>
              <div className="mb-3">
                <h6><FaCalendarCheck className="me-2" />Pending Reservations</h6>
                <h4 className="text-info">{stats?.pendingReservations || 0}</h4>
              </div>
              <div>
                <h6><FaDollarSign className="me-2" />Monthly Revenue</h6>
                <h4 className="text-success">${(stats?.monthlyRevenue || 0).toLocaleString()}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;