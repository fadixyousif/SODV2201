
// import necessary modules and components
import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

// Reservation Edit Modal Component
export function ReservationEditModal({ reservation, onSave, onCancel, deleteReservation }) {
  // state to manage edited reservation data
  const [editedReservation, setEditedReservation] = useState(reservation);

  // handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setEditedReservation(prev => ({ ...prev, [name]: value }));
  }

  // handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    onSave(editedReservation);
  }

  // render the modal with form
  return (
    // Modal for editing reservation
    <Modal show onHide={onCancel} dialogClassName="modal-lg" style={{ zIndex: 2000 }}>
      {/* Modal Header with Title */}
      <Modal.Header closeButton>
        <Modal.Title>Edit Reservation</Modal.Title>
      </Modal.Header>
      {/* Modal Body with Form ordered using columns and rows */}
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div style={{ width: '100%' }} className="justify-content-center">
            <Form.Group className="mb-3">
              <Row>
                <Col md={6}>
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={editedReservation.customerName}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={editedReservation.email}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Row>
                <Col md={6}>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={editedReservation.phone}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={editedReservation.date}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={editedReservation.time}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Row className="justify-content-center">
                <Col md={6} className="text-center">
                  <Form.Label>Number of Guests</Form.Label>
                  <Form.Control
                    type="number"
                    name="guests"
                    min="1"
                    value={editedReservation.guests}
                    onChange={handleChange}
                    required
                    style={{ textAlign: 'center' }}
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Special Request</Form.Label>
              <Form.Control
                as="textarea"
                name="specialRequest"
                rows={3}
                value={editedReservation.specialRequest}
                onChange={handleChange}
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={onCancel} type="button">
                Cancel
              </Button>
              <Button variant="danger" onClick={() => deleteReservation(editedReservation.id)} type="button">
                Delete
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// Reservation Edit Form Component
export function ReservationForm({ handleSubmit, newReservation, setNewReservation }) {
  // render the reservation form
  return (
    // Form for creating a new reservation using bootstrap components using rows and columns for layout
    <Form className="d-flex justify-content-center" onSubmit={handleSubmit}>
      <div style={{ maxWidth: 900, width: '100%' }}>
        <Form.Group className="mb-3">
          <Row>
            <Col md={6}>
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder='Name'
                value={newReservation.customerName}
                onChange={e => setNewReservation({ ...newReservation, customerName: e.target.value })}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder='Email'
                value={newReservation.email}
                onChange={e => setNewReservation({ ...newReservation, email: e.target.value })}
                required
              />
            </Col>
          </Row>
        </Form.Group>
        <Form.Group className="mb-3">
          <Row>
            <Col md={6}>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                placeholder='Phone' 
                value={newReservation.phone}
                onChange={e => setNewReservation({ ...newReservation, phone: e.target.value })}
                required
              />
            </Col>
            <Col md={3}>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={newReservation.date}
                onChange={e => setNewReservation({ ...newReservation, date: e.target.value })}
                required
              />
            </Col>
            <Col md={3}>
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={newReservation.time}
                onChange={e => setNewReservation({ ...newReservation, time: e.target.value })}
                required
              />
            </Col>
          </Row>
        </Form.Group>
        <Form.Group className="mb-3">
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <Form.Label>Number of Guests</Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder='Number of Guests'
                value={newReservation.guests}
                onChange={e => setNewReservation({ ...newReservation, guests: e.target.value })}
                required
                style={{ textAlign: 'center' }}
              />
            </Col>
          </Row>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Special Request</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newReservation.specialRequest}
            onChange={e => setNewReservation({ ...newReservation, specialRequest: e.target.value })}
          />
        </Form.Group>
        <Button type="submit" variant="primary">Submit Reservation</Button>
      </div>
    </Form>
  );
}