// import necessary modules and components
import { useState } from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import verifyAuth from '../../../scripts/verifyAuth';
import Notification from '../../Notification';

// import ReservationEditModal component
import ReservationEditModal from './ReservationEditModal';

// Reservations List Component
function ReservationsList({ reservations, setReservations }) {
    // state to manage selected reservation for editing
    const [selectedReservation, setSelectedReservation] = useState(false);

    // function to handle reservation changes
    const [notification, setNotification] = useState(null);

    async function changeReservation(newReservation) {
        // attempt to update reservation on server (admin)
        const authResult = await verifyAuth();
        const token = authResult?.token || null;
        if (!token) {
            setNotification({ type: 'danger', message: 'Admin authentication required to update reservations.' });
            return;
        }

        try {
            const payload = { status: newReservation.status?.response };
            if (newReservation.status?.reason) payload.reason = newReservation.status.reason;

            await axios.put(`http://localhost:5000/api/reservations/update/${newReservation.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });

            // update the reservations list with the modified reservation
            const updatedReservations = reservations.map((reservation) => (reservation.id === newReservation.id ? { ...reservation, ...newReservation } : reservation));

            // call the handleUpdate prop to update parent state
            setReservations(updatedReservations);
            setSelectedReservation(false);

            setNotification({ type: 'success', message: 'Reservation updated successfully.' });
        } catch (error) {
            console.error('Error updating reservation:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to update reservation.';
            setNotification({ type: 'danger', message: msg });
        }
    }

    // render the reservations list
    return (
        /* 
            Reservations List 
            Displays a list of reservations in a card format with key details and an edit button
            to modify reservation details
        */
        <>
            {reservations.length === 0 ? (
                <p>No reservations found.</p>
            ) : (
                <div className="p-4 mt-4">
                    <Row className="g-4 justify-content-start">
                        {reservations.map((reservation) => (
                            <Col key={reservation.id} xs={12} sm={8} md={6} lg={3} className="d-flex justify-content-center">
                                <Card className="h-100 small-menu-card" style={{
                                    background: '#23272b',
                                    borderColor: '#bfc4cc',
                                    borderRadius: '1.1rem',
                                    minWidth: 0,
                                    maxWidth: 370,
                                    width: '100%',
                                    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)'
                                }}>
                                    <Card.Body className="d-flex flex-column p-3">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="fw-bold text-truncate" style={{ fontSize: '1.13em', color: '#fff' }}>{reservation.customerName}</span>
                                            <span style={{
                                                color:
                                                    reservation.status && reservation.status.response === 'pending' ? '#ffcc00' :
                                                    reservation.status && reservation.status.response === 'confirmed' ? '#4caf50' :
                                                    reservation.status && reservation.status.response === 'cancelled' ? '#e53935' :
                                                    '#adb5bd',
                                                fontWeight: 700,
                                                fontSize: '1em',
                                                textTransform: 'capitalize',
                                                letterSpacing: '0.01em',
                                                background: reservation.status && reservation.status.response ? 'rgba(255,255,255,0.07)' : 'none',
                                                borderRadius: 6,
                                                padding: '2px 12px'
                                            }}>
                                                {reservation.status && reservation.status.response ? reservation.status.response : ''}
                                            </span>
                                        </div>
                                        <div className="mb-1" style={{ fontSize: '0.97em' }}><span style={{ fontWeight: 600, color: '#bfc4cc' }}>ID:</span> {reservation.id}</div>
                                        {/* reservation Accountid */}
                                        <div className="mb-1" style={{ fontSize: '0.97em' }}><span style={{ fontWeight: 600, color: '#bfc4cc' }}>Account ID:</span> {reservation.accountId}</div>
                                        <div className="mb-1 text-muted" style={{ fontSize: '0.97em' }}>{reservation.email}</div>
                                        <div className="mb-1" style={{ fontSize: '0.97em' }}><span style={{ fontWeight: 600, color: '#bfc4cc' }}>Phone:</span> {reservation.phone}</div>
                                        <div className="mb-1" style={{ fontSize: '0.97em' }}><span style={{ fontWeight: 600, color: '#bfc4cc' }}>Date:</span> {reservation.date}</div>
                                        <div className="mb-1" style={{ fontWeight: 600, color: '#bfc4cc', fontSize: '0.97em' }}>Time: <span style={{ fontWeight: 400, color: '#fff' }}>{reservation.time}</span></div>
                                        <div className="mb-1" style={{ fontWeight: 600, color: '#bfc4cc', fontSize: '0.97em' }}>Guests: <span style={{ fontWeight: 400, color: '#fff' }}>{reservation.guests}</span></div>
                                        {reservation.specialRequest && (
                                            <div className="mb-1" style={{ fontSize: '0.97em' }}><span style={{ fontWeight: 600, color: '#bfc4cc' }}>Special:</span> {reservation.specialRequest}</div>
                                        )}
                                        {reservation.status && reservation.status.response === 'cancelled' && reservation.status.reason && (
                                            <div className="alert alert-danger py-1 px-2 mb-1 mt-1" style={{ fontSize: '0.92em' }}>
                                                <strong>Reason:</strong> {reservation.status.reason}
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-end mt-auto">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => setSelectedReservation(reservation)}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
            {selectedReservation && (
                <ReservationEditModal
                    reservation={selectedReservation}
                    onCancel={() => setSelectedReservation(null)}
                    changeReservation={changeReservation}
                />
            )}
            {notification && (
                <Notification show={!!notification} onClose={() => setNotification(null)} type={notification.type} message={notification.message} />
            )}
        </>
    );
}

export default ReservationsList;