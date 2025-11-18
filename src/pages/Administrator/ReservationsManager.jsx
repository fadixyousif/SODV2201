// import necessary modules and components
import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

// import ReservationsList component
import ReservationsList from '../../components/Administrator/Reservations/ReservationsList';
// import storage utility functions
import {loadFromStorage, saveToStorage} from '../../scripts/StorageSaver';

// ReservationsManager component
function ReservationsManager() {
  // state to hold reservations data
  const [reservations, setReservations] = useState([]);

  // load reservations from local storage using useEffect
  useEffect(() => {
    // Load reservations from local storage
    const loadReservations = loadFromStorage('reservations');
    // if reservations exist, set them to state
    if (loadReservations) {
      setReservations(loadReservations);
    }
  }, []);

  // function to handle updates to reservations
  const handleUpdate = (updatedReservations) => {
    // update state and save to local storage
    setReservations(updatedReservations);
    saveToStorage('reservations', updatedReservations);
  };

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
        handleUpdate={handleUpdate}
      />
    </>
  );
}

export default ReservationsManager;