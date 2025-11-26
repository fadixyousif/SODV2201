// import necessary modules and components
import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import axios from 'axios';
import verifyAuth from '../../scripts/verifyAuth';

// import ReservationsList component
import ReservationsList from '../../components/Administrator/Reservations/ReservationsList';
// import storage saver (keep save for local fallback on updates)

// ReservationsManager component
function ReservationsManager() {
  // state to hold reservations data
  const [reservations, setReservations] = useState([]);

  // load reservations from API (admin-only)
  useEffect(() => {
    async function fetchReservations() {
      const authResult = await verifyAuth();
      const token = authResult?.token || null;
      if (!token) {
        setReservations([]);
        return;
      }

      try {
        const resp = await axios.get('http://localhost:5000/api/reservations/all', { headers: { Authorization: `Bearer ${token}` } });
        let reservationsData = resp.data?.reservations || resp.data?.items || resp.data || [];

        // Normalize DB fields status_response/status_reason into reservation.status
        reservationsData = reservationsData.map(r => ({
          ...r,
          date: r.date.replace('T00:00:00.000Z', ''),
          time: r.time.replace(':00.000Z', '').replace('1970-01-01T', ''),
          status: r.status && typeof r.status === 'object' ? r.status : (r.status_response ? { response: r.status_response, reason: r.status_reason } : r.status)
        }));

        setReservations(reservationsData);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setReservations([]);
      }
    }

    fetchReservations();
  }, []);

  // render the ReservationsManager component
  return (
    <>
      <Card className="p-4"
      style={{
        background: '#23272b',
        borderColor: '#495057',
        border: '1px solid',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        color: '#fff'
      }}>
        <h1>Reservations</h1>
        <p>This is the Reservations Management page for administrators.</p>
      </Card>
      <ReservationsList 
        reservations={reservations}
        setReservations={setReservations}
      />
    </>
  );
}

export default ReservationsManager;