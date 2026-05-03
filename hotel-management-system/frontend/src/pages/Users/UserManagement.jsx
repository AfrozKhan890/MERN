// src/pages/Users/UserManagement.js
import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Badge,
  Row,
  Col,
  InputGroup 
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaUserPlus,
  FaUserShield,
  FaUser,
  FaUserCog 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Users.css';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@luxurystay.com', role: 'admin', department: 'Management', status: 'Active', joinDate: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@luxurystay.com', role: 'manager', department: 'Operations', status: 'Active', joinDate: '2023-03-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@luxurystay.com', role: 'receptionist', department: 'Front Desk', status: 'Active', joinDate: '2023-06-10' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@luxurystay.com', role: 'housekeeping', department: 'Housekeeping', status: 'Active', joinDate: '2023-08-05' },
    { id: 5, name: 'David Brown', email: 'david@luxurystay.com', role: 'receptionist', department: 'Front Desk', status: 'Inactive', joinDate: '2023-02-14' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role !== 'admin').length
  };

  const getRoleBadge = (role) => {
    const variants = {
      'admin': 'danger',
      'manager': 'warning',
      'receptionist': 'primary',
      'housekeeping': 'success',
      'maintenance': 'info'
    };
    return <Badge bg={variants[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status) => {
    return <Badge bg={status === 'Active' ? 'success' : 'secondary'}>{status}</Badge>;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      ));
      toast.success('User updated successfully');
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        ...formData,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      toast.success('User added successfully');
    }
    
    handleCloseModal();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
      toast.success('User deleted successfully');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'staff',
      department: '',
      password: '',
      confirmPassword: ''
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="users-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaUserPlus className="me-2" /> Add New User
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="user-stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Total Users</h6>
                  <h3>{stats.total}</h3>
                </div>
                <FaUser className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="user-stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Active Users</h6>
                  <h3>{stats.active}</h3>
                </div>
                <FaUserCog className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="user-stat-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Admin Users</h6>
                  <h3>{stats.admin}</h3>
                </div>
                <FaUserShield className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="user-stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Staff Members</h6>
                  <h3>{stats.staff}</h3>
                </div>
                <FaUser className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-2">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.department}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td><small>{user.joinDate}</small></td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select 
                    name="role" 
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter department"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={selectedUser ? 'Leave blank to keep current' : 'Enter password'}
                    required={!selectedUser}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    required={!selectedUser}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {selectedUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagement;