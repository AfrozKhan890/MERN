// frontend/src/pages/Dashboard/HousekeepingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { FaBroom, FaCheckCircle, FaClock, FaTools } from 'react-icons/fa';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const HousekeepingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/housekeeping');
      if (data.success) {
        const taskList = data.data || [];
        setTasks(taskList);
        setStats({
          total: taskList.length,
          completed: taskList.filter(t => t.status === 'Completed').length,
          pending: taskList.filter(t => t.status === 'Pending').length,
          inProgress: taskList.filter(t => t.status === 'In Progress').length
        });
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/housekeeping/${taskId}`, { status: newStatus });
      toast.success('Task updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">Housekeeping Dashboard</h2>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Total Tasks</h6><h3>{stats.total}</h3></div>
                <FaBroom className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Pending</h6><h3>{stats.pending}</h3></div>
                <FaClock className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>In Progress</h6><h3>{stats.inProgress}</h3></div>
                <FaTools className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div><h6>Completed</h6><h3>{stats.completed}</h3></div>
                <FaCheckCircle className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header><h5>All Cleaning Tasks</h5></Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr><th>Room</th><th>Task Type</th><th>Priority</th><th>Scheduled</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? tasks.map(task => (
                <tr key={task._id}>
                  <td>{task.roomNumber || task.room?.roomNumber || 'N/A'}</td>
                  <td>{task.taskType}</td>
                  <td>
                    <Badge bg={task.priority === 'High' || task.priority === 'Urgent' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td><small>{new Date(task.scheduledDate).toLocaleDateString()}</small></td>
                  <td>
                    <Badge bg={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'warning'}>
                      {task.status}
                    </Badge>
                  </td>
                  <td>
                    {task.status === 'Pending' && (
                      <Button variant="outline-info" size="sm" onClick={() => handleStatusChange(task._id, 'In Progress')}>
                        Start
                      </Button>
                    )}
                    {task.status === 'In Progress' && (
                      <Button variant="outline-success" size="sm" onClick={() => handleStatusChange(task._id, 'Completed')}>
                        Complete
                      </Button>
                    )}
                    {task.status === 'Completed' && <Badge bg="success">Done ✓</Badge>}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center">No tasks found</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default HousekeepingDashboard;