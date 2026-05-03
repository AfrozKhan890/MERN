// frontend/src/pages/Dashboard/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { 
  FaBed, 
  FaCalendarCheck, 
  FaExclamationTriangle,
  FaClipboardList
} from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend
);

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await API.get('/dashboard/manager');
      if (data.success) {
        setStats(data.stats);
        setActivities(data.recentActivities || []);
        setTasks(data.recentTasks || []);
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

  const occupancyData = {
    labels: ['Occupied', 'Available', 'Maintenance'],
    datasets: [{
      label: 'Rooms',
      data: [stats?.occupiedRooms || 0, stats?.availableRooms || 0, stats?.maintenanceRooms || 0],
      backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)']
    }]
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Completed': 'success', 'In Progress': 'info',
      'Pending': 'warning', 'Confirmed': 'primary', 'Cancelled': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">Manager Dashboard</h2>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Occupancy Rate</h6><h3>{stats?.occupancyRate || 0}%</h3></div>
                <FaBed className="stat-icon" />
              </div>
              <small>{stats?.occupiedRooms || 0} of {stats?.totalRooms || 0} rooms</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Today's Check-ins</h6><h3>{stats?.todayCheckins || 0}</h3></div>
                <FaCalendarCheck className="stat-icon" />
              </div>
              <small>{stats?.todayCheckouts || 0} checkouts today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Pending Tasks</h6><h3>{stats?.pendingTasks || 0}</h3></div>
                <FaExclamationTriangle className="stat-icon" />
              </div>
              <small>Requires attention</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Pending Reservations</h6><h3>{stats?.pendingReservations || 0}</h3></div>
                <FaClipboardList className="stat-icon" />
              </div>
              <small>Needs confirmation</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card>
            <Card.Header><h5>Room Occupancy</h5></Card.Header>
            <Card.Body>
              <Bar data={occupancyData} options={{ responsive: true }} height={300} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header><h5>Recent Activities</h5></Card.Header>
            <Card.Body>
              <Table responsive hover size="sm">
                <thead>
                  <tr><th>Guest/Room</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {activities.length > 0 ? activities.slice(0, 5).map((activity, index) => (
                    <tr key={activity._id || index}>
                      <td>{activity.guestName || activity.room?.roomNumber || 'N/A'}</td>
                      <td>{getStatusBadge(activity.status)}</td>
                      <td><small>{new Date(activity.updatedAt).toLocaleDateString()}</small></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-center">No recent activity</td></tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>Recent Tasks</h5>
                <Button variant="outline-primary" size="sm">View All</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Task Type</th>
                    <th>Room</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length > 0 ? tasks.map((task, index) => (
                    <tr key={task._id || index}>
                      <td>{task.taskType || 'N/A'}</td>
                      <td>{task.room?.roomNumber || 'N/A'}</td>
                      <td>{task.assignedTo?.name || 'Unassigned'}</td>
                      <td>{getStatusBadge(task.status)}</td>
                      <td><small>{new Date(task.scheduledDate).toLocaleDateString()}</small></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="text-center">No tasks found</td></tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;