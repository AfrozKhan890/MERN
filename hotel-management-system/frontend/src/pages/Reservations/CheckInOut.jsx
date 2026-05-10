import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Row, Col, Modal, Form, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaSignOutAlt, FaBed } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';

const CheckInOut = () => {
  const [loading, setLoading] = useState(true);
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [activeTab, setActiveTab] = useState('arrivals');

  useEffect(() => { fetchTodayData(); }, []);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/reservations/today');
      if (data.success) {
        setArrivals(data.today?.arrivals || []);
        setDepartures(data.today?.departures || []);
        setCheckedIn(data.today?.checkedIn || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
      // Set empty arrays on error
      setArrivals([]); setDepartures([]); setCheckedIn([]);
    } finally { setLoading(false); }
  };

  const handleCheckIn = async (id) => {
    try {
      await API.put(`/reservations/${id}/checkin`);
      toast.success('Checked in!');
      fetchTodayData();
    } catch (error) { toast.error(error.response?.data?.message || 'Check-in failed'); }
  };

  const handleCheckOut = async () => {
    try {
      await API.put(`/reservations/${selectedReservation._id}/checkout`, {
        additionalCharges, additionalServices, paymentMethod: 'Cash'
      });
      toast.success('Checked out!');
      setShowCheckOutModal(false); fetchTodayData();
    } catch (error) { toast.error('Check-out failed'); }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /><p>Loading check-in/out data...</p></div>;

  return (
    <div>
      <h2 className="mb-4">Check-in / Check-out</h2>
      <Row className="g-4 mb-4">
        {[{tab:'arrivals',icon:<FaCheckCircle/>,color:'success',title:"Today's Arrivals",count:arrivals.length},
          {tab:'departures',icon:<FaSignOutAlt/>,color:'warning',title:"Today's Departures",count:departures.length},
          {tab:'checkedin',icon:<FaBed/>,color:'primary',title:'Currently Checked In',count:checkedIn.length}].map(item=>(
          <Col md={4} key={item.tab}><Card className="stat-card-modern" onClick={()=>setActiveTab(item.tab)} style={{cursor:'pointer',borderLeft:`4px solid var(--${item.color})`}}><Card.Body><div className="d-flex justify-content-between"><div><h6>{item.title}</h6><h3>{item.count}</h3></div><div className={`stat-icon-modern bg-${item.color === 'success' ? 'success' : item.color === 'warning' ? 'warning' : 'primary'}`}>{item.icon}</div></div></Card.Body></Card></Col>
        ))}</Row>

      {activeTab === 'arrivals' && <Card className="modern-card"><Card.Header><h5>Expected Arrivals</h5></Card.Header><Card.Body><Table responsive hover className="modern-table"><thead><tr><th>Guest</th><th>Room</th><th>Expected</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {arrivals.length > 0 ? arrivals.map(r=><tr key={r._id}><td><strong>{r.guestName}</strong><br/><small>{r.email}</small></td><td>{r.room?.roomNumber} ({r.room?.type})</td><td>{new Date(r.checkIn).toLocaleString()}</td><td><Badge bg={r.status==='Confirmed'?'primary':'warning'}>{r.status}</Badge></td><td>{(r.status==='Confirmed'||r.status==='Pending')&&<Button variant="success" size="sm" onClick={()=>handleCheckIn(r._id)}><FaCheckCircle className="me-1"/>Check In</Button>}</td></tr>) : <tr><td colSpan="5" className="text-center py-4">No arrivals today</td></tr>}
      </tbody></Table></Card.Body></Card>}

      {activeTab === 'departures' && <Card className="modern-card"><Card.Header><h5>Expected Departures</h5></Card.Header><Card.Body><Table responsive hover className="modern-table"><thead><tr><th>Guest</th><th>Room</th><th>Expected</th><th>Action</th></tr></thead><tbody>
        {departures.length > 0 ? departures.map(r=><tr key={r._id}><td><strong>{r.guestName}</strong></td><td>{r.room?.roomNumber}</td><td>{new Date(r.checkOut).toLocaleString()}</td><td><Button variant="danger" size="sm" onClick={()=>{setSelectedReservation(r);setShowCheckOutModal(true);}}><FaSignOutAlt className="me-1"/>Check Out</Button></td></tr>) : <tr><td colSpan="4" className="text-center py-4">No departures today</td></tr>}
      </tbody></Table></Card.Body></Card>}

      {activeTab === 'checkedin' && <Card className="modern-card"><Card.Header><h5>Currently Checked In</h5></Card.Header><Card.Body><Table responsive hover className="modern-table"><thead><tr><th>Guest</th><th>Room</th><th>Check-in Time</th><th>Expected Departure</th><th>Action</th></tr></thead><tbody>
        {checkedIn.length > 0 ? checkedIn.map(r=><tr key={r._id}><td><strong>{r.guestName}</strong></td><td>{r.room?.roomNumber}</td><td>{new Date(r.checkIn).toLocaleString()}</td><td>{new Date(r.checkOut).toLocaleDateString()}</td><td><Button variant="danger" size="sm" onClick={()=>{setSelectedReservation(r);setShowCheckOutModal(true);}}><FaSignOutAlt className="me-1"/>Check Out</Button></td></tr>) : <tr><td colSpan="5" className="text-center py-4">No guests checked in</td></tr>}
      </tbody></Table></Card.Body></Card>}

      <Modal show={showCheckOutModal} onHide={()=>setShowCheckOutModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Check Out - {selectedReservation?.guestName}</Modal.Title></Modal.Header>
        <Modal.Body>{selectedReservation&&<>
          <Row className="mb-3"><Col md={6}><p><strong>Room:</strong> {selectedReservation.room?.roomNumber} ({selectedReservation.room?.type})</p><p><strong>Check-in:</strong> {new Date(selectedReservation.checkIn).toLocaleString()}</p></Col><Col md={6}><p><strong>Rate:</strong> ${selectedReservation.room?.price}/night</p><p><strong>Expected Total:</strong> ${selectedReservation.totalAmount}</p></Col></Row>
          <hr/><h6>Additional Charges</h6>
          <Form.Group className="mb-3"><Form.Label>Amount ($)</Form.Label><Form.Control type="number" value={additionalCharges} onChange={e=>setAdditionalCharges(e.target.value)} placeholder="e.g., 50"/></Form.Group>
          <Button variant="outline-secondary" size="sm" className="mb-3" onClick={()=>setAdditionalServices([...additionalServices,{description:'',amount:0}])}>+ Add Service</Button>
          {additionalServices.map((s,i)=><Row key={i} className="mb-2"><Col md={7}><Form.Control placeholder="Description" value={s.description} onChange={e=>{const u=[...additionalServices];u[i].description=e.target.value;setAdditionalServices(u);}}/></Col><Col md={5}><Form.Control type="number" placeholder="Amount" value={s.amount} onChange={e=>{const u=[...additionalServices];u[i].amount=e.target.value;setAdditionalServices(u);}}/></Col></Row>)}
          <hr/><h5 className="text-end">Total: ${(selectedReservation.totalAmount+parseFloat(additionalCharges||0)+additionalServices.reduce((sum,s)=>sum+parseFloat(s.amount||0),0)).toFixed(2)}</h5>
        </>}</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setShowCheckOutModal(false)}>Cancel</Button><Button variant="danger" onClick={handleCheckOut}><FaSignOutAlt className="me-1"/>Complete Check-out</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckInOut;