// import necessary modules and components
import { useEffect, useState, useContext } from 'react';
import { loadFromStorage, saveToStorage } from '../scripts/StorageSaver';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';

// import custom components
import Notification from '../components/Notification';
import Header from '../components/Header';
import { ReservationEditModal, ReservationForm } from '../components/Reservations';
import Cart from '../components/Cart';

// import cart context
import CartContext from '../scripts/cartContext';

function Reservations() {
  // state variables
  const [editingReservation, setEditingReservation] = useState(false);
  const [notification, setNotification] = useState(false);
  const [newReservation, setNewReservation] = useState({
    id: "",
    customerName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    specialRequest: "",
    status: {
      response: "pending",
      reason: ""
    }
  });
  const [myReservations, setMyReservations] = useState([]);
  
  // cart context
  const { cartItems } = useContext(CartContext);
  const [showCart, setShowCart] = useState(false);

  // load reservations from local storage using useEffect
  useEffect(() => {
    // Load reservations from local storage
    const loadReservations = loadFromStorage('reservations');
    // If there are stored reservations, set them to state
    if (loadReservations) {
      setMyReservations(loadReservations);
    }
  }, []);

  // form validation function
  function formValidation() {
    // Check required fields
    if (!newReservation.customerName || !newReservation.email || !newReservation.phone || !newReservation.date || !newReservation.time || !newReservation.guests) {
      setNotification({
        message: "Please fill in all required fields.",
        type: "danger"
      });
      return false;
    }

    // Validate number of guests
    if (isNaN(newReservation.guests) || newReservation.guests <= 0) {
      setNotification({
        message: "Number of guests must be a positive number.",
        type: "danger"
      });
      return false;
    }

    // Validate date not being in the past
    if (new Date(newReservation.date + ' ' + newReservation.time) < new Date()) {
      setNotification({
        message: "Reservation date and time must be in the future.",
        type: "danger"
      });
      return false;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(newReservation.email)) {
      setNotification({
        message: "Please enter a valid email address.",
        type: "danger"
      });
      return false;
    }

    // Check allowed characters and ensure at least 7 digits
    const phoneDigits = newReservation.phone.replace(/\D/g, '');
    if (!/^[\d\s()+-]+$/.test(newReservation.phone) || phoneDigits.length < 7) {
      setNotification({
        message: "Please enter a valid phone number (at least 7 digits).",
        type: "danger"
      });
      return false;
    }

    // Validate special requests length
    if (newReservation.specialRequest.length > 200) {
      setNotification({
        message: "Special requests cannot exceed 200 characters.",
        type: "danger"
      });
      return false;
    }

    // If all validations pass
    return true;
  }

  // handle form submission
  function handleSubmit(e) {
    // prevent default form submission
    e.preventDefault();

    // validate form
    if (!formValidation()) {
      return;
    }

    // Add unique ID to the new reservation
    const newReservationWithId = { ...newReservation, id: Math.floor(Math.random() * 1e9) };
    const updatedReservations = [...myReservations, newReservationWithId];
    // Update state with new reservation
    setMyReservations(updatedReservations);
    // Clear the form
    saveToStorage('reservations', updatedReservations);
    setNewReservation({
      id: "",
      customerName: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      guests: "",
      specialRequest: "",
      status: {
        response: "pending",
        reason: ""
      }
    });
  };

  // delete reservation function
  function deleteReservation(id) {
    // Filter out the reservation to be deleted
    const updatedReservations = myReservations.filter(reservation => reservation.id !== id);
    // Update state and local storage
    setMyReservations(updatedReservations);
    saveToStorage('reservations', updatedReservations);
    // Close the edit modal
    setEditingReservation(false);
  }

  // save edited reservation function
  function handleSaveReservation(updatedReservation) {
    // Update the reservation in state and local storage
    const updatedReservations = myReservations.map(reservation =>
      // check for matching ID and update then replace else return original
      reservation.id === updatedReservation.id ? updatedReservation : reservation
    );

    // Update state and local storage
    setMyReservations(updatedReservations);
    saveToStorage('reservations', updatedReservations);
    // Close the edit modal
    setEditingReservation(false);
  }

  // Header reservation list, new reservation form, cart button, notification, and edit modal components
  return (
    <>
        <Header />
        <div className="text-center" style={{ padding: '2rem' }}>
          <div>
            <h1>My Reservations</h1>
            {myReservations.length === 0 ? (
              <p>No reservations found.</p>
            ) : (
              <Row className="justify-content-center g-4">
                {myReservations.map((reservation, index) => (
                  <Col key={index} xs={12} md={6} lg={3} className="d-flex justify-content-center">
                    <Card
                      className="mb-4 shadow border border-2 mx-auto"
                      style={{
                        background: '#23272b',
                        borderColor: '#bfc4cc',
                        borderRadius: '1.1rem',
                        minWidth: 0,
                        maxWidth: 420,
                        width: '100%'
                      }}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Card.Title as="h5" className="mb-0">Reservation #{reservation.id}</Card.Title>
                          <span className={
                            reservation.status.response === 'pending' ? 'badge bg-warning text-dark' :
                            reservation.status.response === 'confirmed' ? 'badge bg-success' :
                            reservation.status.response === 'cancelled' ? 'badge bg-danger' :
                            'badge bg-secondary'
                          } style={{ fontSize: '1em' }}>{reservation.status.response.charAt(0).toUpperCase() + reservation.status.response.slice(1)}</span>
                        </div>
                        {reservation.status.response === 'cancelled' && reservation.status.reason && (
                          <div className="alert alert-danger py-1 px-2 mb-2" style={{ fontSize: '0.95em' }}>
                            <strong>Reason for cancellation:</strong> {reservation.status.reason}
                          </div>
                        )}
                        <hr className="my-2" />
                        <div className="text-start">
                          <div className="d-flex mb-1 align-items-center">
                            <div style={{ minWidth: 90, fontWeight: 600 }}>Name:</div>
                            <div style={{ marginLeft: 8 }}>{reservation.customerName}</div>
                          </div>
                          <div className="d-flex mb-1 align-items-center">
                            <div style={{ minWidth: 90, fontWeight: 600 }}>Email:</div>
                            <div style={{ marginLeft: 8 }}>{reservation.email}</div>
                          </div>
                          <div className="d-flex mb-1 align-items-center">
                            <div style={{ minWidth: 90, fontWeight: 600 }}>Phone:</div>
                            <div style={{ marginLeft: 8 }}>{reservation.phone}</div>
                          </div>
                          <div className="d-flex mb-1 align-items-center">
                            <div style={{ minWidth: 90, fontWeight: 600 }}>Date:</div>
                            <div style={{ marginLeft: 8 }}>{reservation.date}</div>
                          </div>
                          <div className="d-flex mb-1 align-items-center">
                            <div style={{ minWidth: 90, fontWeight: 600 }}>Time:</div>
                            <div style={{ marginLeft: 8 }}>{reservation.time}</div>
                          </div>
                          <div className="d-flex mb-1 align-items-center">
                            <div style={{ minWidth: 90, fontWeight: 600 }}>Guests:</div>
                            <div style={{ marginLeft: 8 }}>{reservation.guests}</div>
                          </div>
                          <div className="mt-2 mb-2">
                            <div style={{ fontWeight: 600 }}>Special Requests:</div>
                            <div style={{ marginLeft: 2, marginTop: 2 }}>{reservation.specialRequest || '-'}</div>
                          </div>

                          <div className="d-flex justify-content-end mt-2">
                            <Button variant="primary" size="md" onClick={() => setEditingReservation(reservation)}>
                              Edit
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
          <div className="mt-4">
            <h2>Make a New Reservation</h2>
            <ReservationForm
              handleSubmit={handleSubmit}
              newReservation={newReservation}
              setNewReservation={setNewReservation}
            />
          </div>
        </div>
                <div style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 1000
        }}>
          <Button
            variant="success"
            style={{
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              fontSize: "1.5rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              position: "relative"
            }}
            onClick={() => setShowCart(true)}
          >
            {/* Badge for cart count */}
            {cartItems.length > 0 && (
              <Badge
                bg="danger"
                pill
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "-8px",
                  fontSize: "1rem",
                  padding: "0.4em 0.7em"
                }}
              >
                {cartItems.length}
              </Badge>
            )}
            🛒
          </Button>
        </div>
        <Cart show={showCart} setShowCart={setShowCart} />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            show={!!notification}
            onClose={() => setNotification(false)}
          />
        )}
        {editingReservation && (
          <ReservationEditModal
            reservation={editingReservation}
            onSave={handleSaveReservation}
            onCancel={() => setEditingReservation(false)}
            deleteReservation={deleteReservation}
          />
        )}
      </>
  );
}


export default Reservations;