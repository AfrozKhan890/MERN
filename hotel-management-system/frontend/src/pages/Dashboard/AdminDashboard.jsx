// frontend/src/pages/Dashboard/AdminDashboard.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaHotel, FaUsers, FaCalendarCheck, FaDollarSign, FaBed, FaBroom, FaTools, FaUserPlus } from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [roomDistribution, setRoomDistribution] = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await API.get('/dashboard/admin');
      if (data.success) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
        setRoomDistribution(data.roomStatusDistribution || []);
      }
    } catch (error) { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /><p>Loading dashboard...</p></div>;

  const statCards = [
    { title: 'Total Rooms', value: stats?.totalRooms || 0, subtitle: `${stats?.availableRooms || 0} Available`, icon: <FaHotel />, color: 'primary', delay: 0 },
    { title: 'Total Guests', value: stats?.totalGuests || 0, subtitle: `${stats?.newGuestsToday || 0} new today`, icon: <FaUserPlus />, color: 'success', delay: 0.1 },
    { title: "Today's Check-ins", value: stats?.todayCheckins || 0, subtitle: `${stats?.todayCheckouts || 0} Check-outs`, icon: <FaCalendarCheck />, color: 'info', delay: 0.2 },
    { title: 'Total Users', value: stats?.totalUsers || 0, subtitle: `${stats?.activeStaff || 0} Staff Active`, icon: <FaUsers />, color: 'warning', delay: 0.3 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="page-header"><div><h2>Admin Dashboard</h2><p className="breadcrumb-text">Real-time hotel operations overview</p></div></div>
      
      <Row className="g-4 mb-4">
        {statCards.map((card, idx) => (
          <Col md={3} key={idx}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: card.delay }}>
              <Card className="stat-card-modern"><Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div><p className="stat-label">{card.title}</p><h3 className="stat-value">{card.value}</h3><small className="stat-subtitle">{card.subtitle}</small></div>
                  <div className={`stat-icon-modern bg-${card.color}`}>{card.icon}</div>
                </div>
              </Card.Body></Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-4">
        <Col md={8}><Card className="modern-card"><Card.Header><h5 className="mb-0">Revenue Overview</h5></Card.Header><Card.Body>
          <Line data={{ labels: ['Today', 'This Week', 'This Month'], datasets: [{ label: 'Revenue', data: [stats?.todayRevenue||0, (stats?.monthlyRevenue||0)/4, stats?.monthlyRevenue||0], borderColor: '#0B1D3A', backgroundColor: 'rgba(11,29,58,0.06)', tension: 0.4, fill: true }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} height={280} />
        </Card.Body></Card></Col>
        <Col md={4}><Card className="modern-card"><Card.Header><h5 className="mb-0">Room Distribution</h5></Card.Header><Card.Body>
          <Pie data={{ labels: roomDistribution.map(r => r._id||'Unknown'), datasets: [{ data: roomDistribution.map(r => r.count||0), backgroundColor: ['#0B1D3A','#2D6A4F','#E9C46A','#C1121F','#457B9D'] }] }} options={{ responsive: true }} height={280} />
        </Card.Body></Card></Col>
      </Row>

      <Row className="g-4">
        <Col md={8}><Card className="modern-card"><Card.Header><h5 className="mb-0">Recent Bookings</h5></Card.Header><Card.Body>
          <Table responsive hover className="modern-table mb-0"><thead><tr><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead><tbody>
            {recentBookings.length > 0 ? recentBookings.map((b,i) => (
              <tr key={b._id||i}><td><strong>{b.guestName||'N/A'}</strong></td><td>{b.room?.roomNumber||'N/A'}</td><td>{new Date(b.checkIn).toLocaleDateString()}</td><td>{new Date(b.checkOut).toLocaleDateString()}</td><td><Badge className="badge-modern" bg={b.status==='Checked In'?'success':b.status==='Confirmed'?'primary':'warning'}>{b.status}</Badge></td></tr>
            )) : <tr><td colSpan="5" className="text-center text-muted py-4">No recent bookings</td></tr>}
          </tbody></Table>
        </Card.Body></Card></Col>
        <Col md={4}><Card className="modern-card h-100"><Card.Header><h5 className="mb-0">Quick Stats</h5></Card.Header><Card.Body>
          {[{icon:<FaTools/>,label:'Maintenance',value:stats?.maintenanceRooms||0,color:'#C1121F'},{icon:<FaBroom/>,label:'Cleaning',value:stats?.cleaningRooms||0,color:'#E9C46A'},{icon:<FaCalendarCheck/>,label:'Pending Reservations',value:stats?.pendingReservations||0,color:'#457B9D'},{icon:<FaDollarSign/>,label:'Monthly Revenue',value:`$${(stats?.monthlyRevenue||0).toLocaleString()}`,color:'#2D6A4F'}].map((item,i)=>(
            <div key={i} className="d-flex align-items-center mb-3 pb-3 border-bottom">
              <div className="me-3" style={{color:item.color,fontSize:'1.3rem'}}>{item.icon}</div>
              <div><small className="text-muted">{item.label}</small><h5 className="mb-0" style={{color:item.color}}>{item.value}</h5></div>
            </div>
          ))}</Card.Body></Card></Col>
      </Row>
    </motion.div>
  );
};

export default AdminDashboard;