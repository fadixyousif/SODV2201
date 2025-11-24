// import necessary modules and components
import { useEffect, useState, useContext } from 'react';
import { loadFromStorage, saveToStorage } from '../scripts/StorageSaver';
import { Card, Button, Row, Col, Badge, Form, Spinner } from 'react-bootstrap';
import verifyAuth from '../scripts/verifyAuth';

// import custom components
import Notification from '../components/Notification';
import Header from '../components/Header';
import { ReservationEditModal, ReservationForm } from '../components/Reservations';
import Cart from '../components/Cart';

// import cart context
import CartContext from '../scripts/cartContext';
import axios from 'axios';

function Reservations() {
  // state variables
  const [isUserAuthenticated, setIsUserAuthenticated] = useState({
    success: false,
    token: ""
  });
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
  const [publicReservationId, setPublicReservationId] = useState("");
  
  // cart context
  const { cartItems } = useContext(CartContext);
  const [showCart, setShowCart] = useState(false);

  // load reservations from server on component mount
  useEffect(() => {
    // Load reservations for authenticated user
    async function loadReservations() {
      // Verify authentication
      const authResult = await verifyAuth();

      if (authResult && authResult.success) {
        setIsUserAuthenticated({
          success: true,
          token: authResult.token
        });

        try {
          const resp = await axios.get("http://localhost:5000/api/reservations/myreservations", {
            headers: { Authorization: `Bearer ${authResult.token}` }
          });

          setMyReservations(resp.data.reservations.map(reservation => ({
            id: reservation.id,
            customerName: reservation.customerName,
            email: reservation.email,
            phone: reservation.phone,
            date: reservation.date.replace(/T00:00:00\.000Z$/, ''),
            time: reservation.time.replace(/^1970-01-01T/, '').replace(/:00\.000Z$/, ''),
            guests: reservation.guests,
            specialRequest: reservation.specialRequest,
            status: {
              response: reservation.status_response,
              reason: reservation.status_reason
            }
          })));
        } catch (error) {
          
          // Log full axios error plus any server response body for debugging
          console.error("Reservations fetch error:", error);

          // Show notification only if error is not "No reservations found"
          if (error.response) {
            // Only show error if it's not the "No reservations found" message
            if (error.response.data?.message !== 'No reservations found') {
              setNotification({ message: error.response.data?.message || JSON.stringify(error.response.data), type: 'danger' });
            }
          // Network or other error
          } else if (error.request) {
            setNotification({ message: 'No response from server. Check your network.', type: 'danger' });
          // Other unexpected error
          } else {
            setNotification({ message: error.message || 'An unexpected error occurred.', type: 'danger' });
          }
        }
      }
    }
    loadReservations();
  }, []);

  // Public lookup by reservation id (no auth required)
  async function fetchPublicReservationById(e) {
    if (e && e.preventDefault) e.preventDefault();

    // Validate input
    if (!publicReservationId) {
      setNotification({ message: 'Please enter a reservation ID.', type: 'danger' });
      return;
    }

    // get reservation from server by id
    try {
      const resp = await axios.get(`http://localhost:5000/api/reservations/id/${encodeURIComponent(publicReservationId)}`);

      // initalize reservation data
      const reservation = resp.data.reservation || resp.data.data || resp.data;

      // check if reservation found
      if (!reservation) {

        // show not found notification
        setNotification({ message: 'Reservation not found.', type: 'danger' });
        setMyReservations([]);
      } else {

        // set reservation data
        setMyReservations([{
          id: reservation.id,
          customerName: reservation.customerName,
          email: reservation.email,
          phone: reservation.phone,
          date: reservation.date.replace(/T00:00:00\.000Z$/, ''),
          time: reservation.time.replace(/^1970-01-01T/, '').replace(/:00\.000Z$/, ''),
          guests: reservation.guests,
          specialRequest: reservation.specialRequest,
          status: {
            response: reservation.status_response,
            reason: reservation.status_reason
          }
        }]);
      }
    } catch (error) {
      if (error.response) {
        setNotification({ message: error.response.data?.message || JSON.stringify(error.response.data), type: 'danger' });
      } else if (error.request) {
        setNotification({ message: 'No response from server. Check your network.', type: 'danger' });
      } else {
        setNotification({ message: error.message || 'An unexpected error occurred.', type: 'danger' });
      }
      setMyReservations([]);
    }
  }

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

    // // Add unique ID to the new reservation
    // const newReservationWithId = { ...newReservation, id: Math.floor(Math.random() * 1e9) };
    // const updatedReservations = [...myReservations, newReservationWithId];
    // // Update state with new reservation
    // setMyReservations(updatedReservations);
    // // Clear the form
    // saveToStorage('reservations', updatedReservations);
    // setNewReservation({
    //   id: "",
    //   customerName: "",
    //   email: "",
    //   phone: "",
    //   date: "",
    //   time: "",
    //   guests: "",
    //   specialRequest: "",
    //   status: {
    //     response: "pending",
    //     reason: ""
    //   }
    // });

    // POST /api/reservations/create

    async function postReservation() {
      try {
        let resp = null;
        let newReservationData = {
          customerName: newReservation.customerName,
          email: newReservation.email,
          phone: newReservation.phone,
          reservationDate: newReservation.date,
          time: newReservation.time,
          numberOfGuests: Number(newReservation.guests),
          specialRequest: newReservation.specialRequest
        }
        if (isUserAuthenticated.success) {
          resp = await axios.post("http://localhost:5000/api/reservations/create", newReservationData, {
            headers: { Authorization: `Bearer ${isUserAuthenticated.token}` }
          });
        } else {
          resp = await axios.post("http://localhost:5000/api/reservations/create", newReservationData);
        }

        if(resp.data && resp.data.success) {
          setNotification({
            message: resp.data.message || 'Reservation created successfully!',
            type: 'success'
          });
          // Clear the form
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
        } else {
          setNotification({
            message: resp.data.message || 'Failed to create reservation. Please try again.',
            type: 'danger'
          });
        }
      } catch (error) {
        console.error("Error creating reservation:", error);
        if (error.response) {
          setNotification({ message: error.response.data?.message || JSON.stringify(error.response.data), type: 'danger' });
        } else if (error.request) {
          setNotification({ message: 'No response from server. Check your network.', type: 'danger' });
        } else {
          setNotification({ message: 'An unexpected error occurred.', type: 'danger' });
        }
      }
    }
    postReservation();
  };

  // delete reservation function
  function deleteReservation(id) {
    // cancel reservation function
    async function cancelReservation() {
      try {
        // include auth token if user is authenticated
        if (isUserAuthenticated.success) {
          const response = await axios.delete(`http://localhost:5000/api/reservations/cancel/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${isUserAuthenticated.token}` }
          });

          setNotification({
            message: response.data?.message || 'Reservation cancelled successfully.',
            type: 'success'
          });
        } else {
          const response = await axios.delete(`http://localhost:5000/api/reservations/cancel/${encodeURIComponent(id)}`);

          setNotification({
            message: response.data?.message || 'Reservation cancelled successfully.',
            type: 'success'
          });
        }  
        setEditingReservation(false);
        set  
      } catch (error) {
        console.error("Error deleting reservation:", error);
      }
    }
    cancelReservation();
  }

  // Header reservation list, new reservation form, cart button, notification, and edit modal components
  return (
    <>
        <Header />
        <div className="text-center" style={{ padding: '2rem' }}>
          <div>
            <h1>My Reservations</h1>
            {!isUserAuthenticated.success && (
              <div className="mb-4">
                <h5>Lookup a reservation</h5>
                <Form onSubmit={fetchPublicReservationById} className="d-flex justify-content-center align-items-center gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Enter reservation ID"
                    value={publicReservationId}
                    onChange={(e) => setPublicReservationId(e.target.value)}
                    style={{ maxWidth: 320 }}
                  />
                  <Button type="submit" variant="primary" onClick={fetchPublicReservationById}>
                    Fetch Reservation
                  </Button>
                  <Button variant="outline-secondary" onClick={() => { setPublicReservationId(''); setMyReservations([]); setNotification(false); }}>
                    Clear
                  </Button>
                </Form>
              </div>
            )}
            {myReservations.length === 0 ? (
              isUserAuthenticated.success ? <p>No reservations found. Please make a new reservation below.</p> : ""
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
            isUserAuthenticated={isUserAuthenticated}
            onCancel={() => setEditingReservation(false)}
            deleteReservation={deleteReservation}
          />
        )}
      </>
  );
}


export default Reservations;