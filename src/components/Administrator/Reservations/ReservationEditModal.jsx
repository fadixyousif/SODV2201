import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function ReservationEditModal({ reservation, onCancel, changeReservation }) {
    const [editedReservation, setEditedReservation] = useState({ ...reservation });

    // render the modal with form
    return (
        /* 
            Modal for editing reservation 
            includes fields for customer name, email, phone, date, time, guests, special requests, and status
            uses Cold and Row for layout for better organization
            with buttons to cancel or save changes
        */
        <Modal show={!!reservation} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Reservation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={editedReservation.customerName}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={editedReservation.email}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            value={editedReservation.phone}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={editedReservation.date}
                            onChange={(e) => setEditedReservation({ ...editedReservation, date: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Time</Form.Label>
                        <Form.Control
                            type="time"
                            value={editedReservation.time}
                            onChange={(e) => setEditedReservation({ ...editedReservation, time: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Guests</Form.Label>
                        <Form.Control
                            type="number"
                            value={editedReservation.guests}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Special Requests</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={editedReservation.specialRequest}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Control
                            as="select"
                            value={editedReservation.status.response}
                            onChange={(e) => setEditedReservation({ ...editedReservation, status: { response: e.target.value } })}
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </Form.Control>
                    </Form.Group>
                    {editedReservation.status.response === 'cancelled' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Cancellation Reason</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editedReservation.status.reason}
                                onChange={(e) => setEditedReservation({ ...editedReservation, status: { ...editedReservation.status, reason: e.target.value } })}
                            />
                        </Form.Group>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => changeReservation(editedReservation)}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ReservationEditModal;