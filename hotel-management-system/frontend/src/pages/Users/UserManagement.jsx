// frontend/src/pages/Users/UserManagement.jsx - COMPLETE USER MANAGEMENT
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, Pagination, InputGroup } from 'react-bootstrap';
import { FaUserPlus, FaEdit, FaTrash, FaUserCheck, FaUserTimes, FaShieldAlt, FaSearch, FaFilter, FaDownload, FaEye, FaBan, FaCheckCircle, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'receptionist'
  });

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/auth/users');
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await API.put(`/auth/users/${selectedUser._id}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedUser || !newStatus) return;
    
    try {
      await API.put(`/auth/users/${selectedUser._id}/status`, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
      setShowStatusModal(false);
      setSelectedUser(null);
      setNewStatus('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      await API.post('/auth/register', formData);
      toast.success('User created successfully');
      fetchUsers();
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'receptionist' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await API.delete(`/auth/users/${user._id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: '#ef4444', icon: <FaShieldAlt /> },
      manager: { bg: '#f59e0b', icon: <FaUserCheck /> },
      receptionist: { bg: '#3b82f6', icon: <FaEye /> },
      housekeeping: { bg: '#10b981', icon: <FaCheckCircle /> },
      maintenance: { bg: '#6b7280', icon: <FaBan /> },
      guest: { bg: '#8b5cf6', icon: <FaUserPlus /> }
    };
    const c = colors[role] || colors.guest;
    return (
      <Badge className={`role-badge role-${role}`} style={{ background: c.bg }}>
        {c.icon} {role?.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? <Badge className="status-badge status-active"><FaCheckCircle /> Active</Badge>
      : <Badge className="status-badge status-inactive"><FaUserTimes /> Inactive</Badge>;
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    inactive: users.filter(u => u.status === 'Inactive').length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    staff: users.filter(u => ['receptionist', 'housekeeping', 'maintenance'].includes(u.role)).length,
    guests: users.filter(u => u.role === 'guest').length
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management-page">
      <div className="page-header-modern">
        <div>
          <h1>User Management</h1>
          <p>Manage staff accounts and user roles</p>
        </div>
        <Button className="btn-create" onClick={() => setShowCreateModal(true)}>
          <FaUserPlus /> Create New User
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <div className="stat-mini-card">
            <div className="stat-mini-icon total">👥</div>
            <div>
              <h3>{stats.total}</h3>
              <span>Total Users</span>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-mini-card">
            <div className="stat-mini-icon active">✅</div>
            <div>
              <h3>{stats.active}</h3>
              <span>Active</span>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-mini-card">
            <div className="stat-mini-icon staff">👔</div>
            <div>
              <h3>{stats.staff}</h3>
              <span>Staff Members</span>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-mini-card">
            <div className="stat-mini-icon guests">🏨</div>
            <div>
              <h3>{stats.guests}</h3>
              <span>Guest Accounts</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filters-card">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="maintenance">Maintenance</option>
                <option value="guest">Guest</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="users-table-card">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? paginatedUsers.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.phone ? (
                        <><FaPhone className="me-1" /> {user.phone}</>
                      ) : '—'}
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{user.department || '—'}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleModal(true);
                          }}
                          title="Change Role"
                        >
                          <FaShieldAlt />
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewStatus(user.status);
                            setShowStatusModal(true);
                          }}
                          title="Change Status"
                        >
                          {user.status === 'Active' ? <FaUserTimes /> : <FaUserCheck />}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="empty-state">
                        <p>No users found</p>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                          Create your first user
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-modern mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Change Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered className="premium-modal">
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <div className="user-preview">
                <div className="user-avatar-large">{selectedUser.name?.charAt(0)}</div>
                <div>
                  <h5>{selectedUser.name}</h5>
                  <p className="text-muted">{selectedUser.email}</p>
                </div>
              </div>
              <Form.Group>
                <Form.Label>Current Role</Form.Label>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>New Role</Form.Label>
                <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="guest">Guest</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleRoleUpdate}>Update Role</Button>
        </Modal.Footer>
      </Modal>

      {/* Change Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered className="premium-modal">
        <Modal.Header closeButton>
          <Modal.Title>Change User Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <div className="user-preview">
                <div className="user-avatar-large">{selectedUser.name?.charAt(0)}</div>
                <div>
                  <h5>{selectedUser.name}</h5>
                  <p className="text-muted">{selectedUser.email}</p>
                </div>
              </div>
              <Form.Group>
                <Form.Label>Current Status</Form.Label>
                <div>{getStatusBadge(selectedUser.status)}</div>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>New Status</Form.Label>
                <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
              {newStatus === 'Inactive' && (
                <Alert variant="warning" className="mt-3">
                  Inactive users will not be able to login to the system.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleStatusUpdate}>Update Status</Button>
        </Modal.Footer>
      </Modal>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered className="premium-modal" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateUser}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength="6"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="guest">Guest</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Create User</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagement;