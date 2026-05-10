import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Form, Spinner, Nav } from 'react-bootstrap';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Reports.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardStats();
    else if (activeTab === 'occupancy') fetchOccupancyReport();
    else if (activeTab === 'revenue') fetchRevenueReport();
    else if (activeTab === 'guests') fetchGuestReport();
  }, [activeTab, year]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/reports/dashboard');
      setDashboardStats(data.stats);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupancyReport = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/reports/occupancy?year=${year}`);
      setOccupancyData(data);
    } catch (error) {
      toast.error('Failed to load occupancy report');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/reports/revenue?year=${year}`);
      setRevenueData(data);
    } catch (error) {
      toast.error('Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestReport = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/reports/guests');
      setGuestData(data);
    } catch (error) {
      toast.error('Failed to load guest report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /><p>Loading reports...</p></div>;

  return (
    <div>
      <h2 className="mb-4">Reports & Analytics</h2>

      <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav.Item><Nav.Link eventKey="dashboard">Dashboard</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="occupancy">Occupancy</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="revenue">Revenue</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="guests">Guests</Nav.Link></Nav.Item>
      </Nav>

      {activeTab === 'dashboard' && dashboardStats && (
        <>
          <Row className="g-4 mb-4">
            <Col md={3}><Card className="stat-card bg-primary text-white"><Card.Body><h6>Total Rooms</h6><h3>{dashboardStats.rooms.totalRooms}</h3><small>{dashboardStats.rooms.occupancyRate}% Occupied</small></Card.Body></Card></Col>
            <Col md={3}><Card className="stat-card bg-success text-white"><Card.Body><h6>Current Guests</h6><h3>{dashboardStats.reservations.currentGuests}</h3><small>{dashboardStats.reservations.todayCheckins} arrivals today</small></Card.Body></Card></Col>
            <Col md={3}><Card className="stat-card bg-info text-white"><Card.Body><h6>Monthly Revenue</h6><h3>${(dashboardStats.revenue.thisMonth || 0).toLocaleString()}</h3><small>{dashboardStats.revenue.revenueGrowth}% vs last month</small></Card.Body></Card></Col>
            <Col md={3}><Card className="stat-card bg-warning text-white"><Card.Body><h6>VIP Guests</h6><h3>{dashboardStats.guests.vipGuests}</h3><small>{dashboardStats.guests.totalGuests} total guests</small></Card.Body></Card></Col>
          </Row>
          <Row className="g-4">
            <Col md={6}>
              <Card><Card.Header><h5>Revenue Today</h5></Card.Header><Card.Body>
                <h2 className="text-success">${(dashboardStats.revenue.today || 0).toLocaleString()}</h2>
              </Card.Body></Card>
            </Col>
            <Col md={6}>
              <Card><Card.Header><h5>Staff Overview</h5></Card.Header><Card.Body>
                <p>Active Staff: <strong>{dashboardStats.staff.activeStaff}</strong> / {dashboardStats.staff.totalStaff}</p>
                <p>Pending Tasks: <strong className="text-warning">{dashboardStats.tasks.pendingTasks}</strong></p>
              </Card.Body></Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'occupancy' && occupancyData && (
        <>
          <Form.Select className="mb-3 w-auto" value={year} onChange={(e) => setYear(e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </Form.Select>
          <Row className="g-4">
            <Col md={6}>
              <Card><Card.Header><h5>Room Type Distribution</h5></Card.Header><Card.Body>
                <Pie data={{
                  labels: occupancyData.roomTypeDistribution?.map(r => r._id) || [],
                  datasets: [{ data: occupancyData.roomTypeDistribution?.map(r => r.count) || [], backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0'] }]
                }} height={300} />
              </Card.Body></Card>
            </Col>
            <Col md={6}>
              <Card><Card.Header><h5>Daily Occupancy</h5></Card.Header><Card.Body>
                <Line data={{
                  labels: occupancyData.dailyOccupancy?.map(d => d._id) || [],
                  datasets: [{ label: 'Reservations', data: occupancyData.dailyOccupancy?.map(d => d.reservations) || [], borderColor: '#36A2EB' }]
                }} height={300} />
              </Card.Body></Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'revenue' && revenueData && (
        <>
          <Form.Select className="mb-3 w-auto" value={year} onChange={(e) => setYear(e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </Form.Select>
          <Card className="mb-4">
            <Card.Body>
              <Row><Col><h6>Total Revenue</h6><h3>${(revenueData.summary?.totalRevenue || 0).toLocaleString()}</h3></Col>
              <Col><h6>Total Invoices</h6><h3>{revenueData.summary?.totalInvoices || 0}</h3></Col>
              <Col><h6>Average Invoice</h6><h3>${revenueData.summary?.averageInvoice || 0}</h3></Col></Row>
            </Card.Body>
          </Card>
          <Card><Card.Header><h5>Monthly Revenue</h5></Card.Header><Card.Body>
            <Bar data={{
              labels: revenueData.monthlyRevenue?.map(m => `Month ${m._id}`) || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
              datasets: [{ label: 'Revenue ($)', data: revenueData.monthlyRevenue?.map(m => m.revenue) || [], backgroundColor: '#36A2EB' }]
            }} height={300} />
          </Card.Body></Card>
        </>
      )}

      {activeTab === 'guests' && guestData && (
        <Row className="g-4">
          <Col md={6}>
            <Card><Card.Header><h5>Top Frequent Guests</h5></Card.Header><Card.Body>
              <Table hover size="sm">
                <thead><tr><th>Name</th><th>Email</th><th>Stays</th><th>VIP</th></tr></thead>
                <tbody>
                  {guestData.topGuests?.map(g => (
                    <tr key={g._id}><td>{g.firstName} {g.lastName}</td><td>{g.email}</td><td>{g.totalStays}</td><td>{g.vipStatus ? '⭐' : '-'}</td></tr>
                  )) || <tr><td colSpan="4">No data</td></tr>}
                </tbody>
              </Table>
            </Card.Body></Card>
          </Col>
          <Col md={6}>
            <Card><Card.Header><h5>New Guests Trend</h5></Card.Header><Card.Body>
              <Line data={{
                labels: guestData.newGuestTrend?.map(t => t._id) || [],
                datasets: [{ label: 'New Guests', data: guestData.newGuestTrend?.map(t => t.count) || [], borderColor: '#4BC0C0' }]
              }} height={300} />
            </Card.Body></Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ReportsAnalytics;