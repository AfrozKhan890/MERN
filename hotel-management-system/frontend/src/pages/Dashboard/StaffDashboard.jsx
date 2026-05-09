// frontend/src/pages/Dashboard/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { 
  FaCalendarCheck, 
  FaClipboardList, 
  FaCheckCircle,
  FaClock 
} from 'react-icons/fa';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await API.get('/dashboard/staff');
      if (data.success) {
        setStats(data.stats);
        setTasks(data.todayTasks || []);
        setCheckins(data.todayCheckins || []);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/housekeeping/${taskId}`, { status: newStatus });
      toast.success(`Task ${newStatus}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update task');
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

  const getStatusBadge = (status) => {
    const variants = {
      'Completed': 'success', 'In Progress': 'info',
      'Pending': 'warning', 'Checked In': 'primary',
      'Expected': 'secondary', 'Cancelled': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">Staff Dashboard</h2>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>My Tasks Today</h6><h4>{stats?.totalTasks || 0}</h4></div>
                <FaClipboardList className="stat-icon" />
              </div>
              <small>{stats?.pendingTasks || 0} pending</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Completed</h6><h3>{stats?.completedTasks || 0}</h3></div>
                <FaCheckCircle className="stat-icon" />
              </div>
              <small>{stats?.completionRate || 0}% completion</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Today's Check-ins</h6><h3>{checkins.length || 0}</h3></div>
                <FaCalendarCheck className="stat-icon" />
              </div>
              <small>Scheduled arrivals</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card>
            <Card.Header><h5>Today's Schedule</h5></Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr><th>Guest</th><th>Room</th><th>Check-in</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {checkins.length > 0 ? checkins.map((checkin, index) => (
                    <tr key={checkin._id || index}>
                      <td>{checkin.guestName || 'N/A'}</td>
                      <td>{checkin.room?.roomNumber || 'N/A'}</td>
                      <td>{new Date(checkin.checkIn).toLocaleString()}</td>
                      <td>{getStatusBadge(checkin.status)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center">No check-ins today</td></tr>
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
            <Card.Header><h5>My Tasks</h5></Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr><th>Room</th><th>Task Type</th><th>Priority</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {tasks.length > 0 ? tasks.map((task, index) => (
                    <tr key={task._id || index}>
                      <td>{task.room?.roomNumber || 'N/A'}</td>
                      <td>{task.taskType || 'N/A'}</td>
                      <td>
                        <Badge bg={task.priority === 'High' || task.priority === 'Urgent' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}>
                          {task.priority || 'Medium'}
                        </Badge>
                      </td>
                      <td>{getStatusBadge(task.status)}</td>
                      <td>
                        {task.status === 'Pending' && (
                          <Button variant="outline-info" size="sm" onClick={() => handleTaskStatusChange(task._id, 'In Progress')}>
                            Start
                          </Button>
                        )}
                        {task.status === 'In Progress' && (
                          <Button variant="outline-success" size="sm" onClick={() => handleTaskStatusChange(task._id, 'Completed')}>
                            Complete
                          </Button>
                        )}
                        {task.status === 'Completed' && <Badge bg="success">Done ✓</Badge>}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="text-center">No tasks assigned for today</td></tr>
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

export default StaffDashboard;