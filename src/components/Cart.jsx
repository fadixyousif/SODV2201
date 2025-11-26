// import necessary modules and components
import { useContext, useEffect, useState } from "react";
import { Offcanvas, ListGroup, Row, Col, Button, Image, Modal, Form } from "react-bootstrap";

// import Notification component
import Notification from "./Notification";
import CartContext from "../scripts/cartContext";
import axios from 'axios';
import verifyAuth from '../scripts/verifyAuth';

// import storage utility functions
import { loadFromStorage } from "../scripts/StorageSaver";

function CheckoutModal({ showCheckout, setShowCheckout, getOrder, setOrder, handleCheckout }) {
  // render the checkout modal
   return (
    /* 
      Custom Modal for checkout process
      includes form fields for customer name, order type, date, and time
      has validation to ensure all fields are filled before confirming
      has buttons to close or confirm checkout
    */
    <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Checkout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Checkout form fields can be added here */}
        <Form>
          <Form.Group controlId="formCustomerName">
            <Form.Label>Customer Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={getOrder.customerName}
              onChange={(e) => setOrder({ ...getOrder, customerName: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="formOrderType">
            <Form.Label>Order Type</Form.Label>
            <Form.Control
              as="select"
              value={getOrder.type}
              onChange={(e) => setOrder({ ...getOrder, type: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
              <option value="dine-in">Dine In</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={getOrder.email}
              onChange={(e) => setOrder({ ...getOrder, email: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="formPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Phone number"
              value={getOrder.phone}
              onChange={(e) => setOrder({ ...getOrder, phone: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="formOrderDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={getOrder.date}
              onChange={(e) => setOrder({ ...getOrder, date: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="formOrderTime">
            <Form.Label>Time</Form.Label>
            <Form.Control
              type="time"
              value={getOrder.time}
              onChange={(e) => setOrder({ ...getOrder, time: e.target.value })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowCheckout(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCheckout}>
          Confirm Checkout
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Cart Component
function Cart({ show, setShowCart }) {
  // access cart context
  const { cartItems, saveCartToStorage } = useContext(CartContext);

  // checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [getOrder, setOrder] = useState({
    customerName: "",
    email: "",
    phone: "",
    type: "",
    status: "pending",
    totalPrice: 0,
    date: "",
    time: "",
    items: []
  });
  const [getOrders, setOrders] = useState([]);
  
  // notification state
  const [notification, setNotification] = useState(null);

  // load existing orders from local storage using useEffect
  useEffect(() => {
    // Load orders from local storage or API
    const storedOrders = loadFromStorage("orders");
    if (storedOrders) {
      setOrders(storedOrders);
    }
  }, []);

  // function to delete item from cart
  function deleteItemFromCart(itemId) {
    // using filter if item id does not match, keep it in the cart
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    // update cart in context and local storage
    saveCartToStorage(updatedCart);
  }

  // form validation function
  function formValidation() {

    // check required fields
    if (!getOrder.customerName || !getOrder.email || !getOrder.phone || !getOrder.type || !getOrder.date || !getOrder.time) {
      setNotification({ type: 'danger', message: 'Please fill in all required fields.' });
      return false;
    }
    // simple email validation
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(getOrder.email)) {
      setNotification({ type: 'danger', message: 'Please enter a valid email address.' });
      return false;
    }

    // basic phone validation
    if (getOrder.phone.trim().length < 6) {
      setNotification({ type: 'danger', message: 'Please enter a valid phone number.' });
      return false;
    }

    // check date is not in the past
    if (new Date(getOrder.date) < new Date().setHours(0,0,0,0)) {
      setNotification({ type: 'danger', message: 'Order date cannot be in the past.' });
      return false;
    }

    // check time is valid (simple check)
    const timeRe = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRe.test(getOrder.time)) {
      setNotification({ type: 'danger', message: 'Please enter a valid time.' });
      return false;
    }

    // clear notification if validation passes
    setNotification(null);
    return true;
  }

  async function handleCheckout() {
    // validate form before proceeding
    if (!formValidation()) return;
    // close checkout modal
    setShowCheckout(false);

    // prepare new order data
    const newData = {
      customerName: getOrder.customerName,
      email: getOrder.email,
      phone: getOrder.phone,
      items: cartItems,
      type: getOrder.type,
      date: getOrder.date,
      time: getOrder.time,
      totalPrice: cartItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0)
    };

    try {
      // verify authentication for order placement
      const authResult = await verifyAuth();

      // prepare headers with token if authenticated
      const token = authResult?.token || null;

      // set authorization header if token exists
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const resp = await axios.post('http://localhost:5000/api/orders/place', newData, { headers });
      setNotification({ type: 'success', message: resp.data?.message || 'Order placed successfully' });

      // reset form and clear cart
      setOrder({
        id: '',
        customerName: '',
        email: '',
        phone: '',
        type: '',
        status: 'pending',
        totalPrice: 0,
        date: '',
        time: '',
        items: []
      });
      saveCartToStorage([]);
    } catch (error) {
      console.error('Error placing order:', error);
      setNotification({ type: 'danger', message: error.response?.data?.message || 'Failed to place order' });
    }
  }
  // Calculate total price
  const total = cartItems?.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0) || 0;

  // render the cart component
  return (
    /* 
      Offcanvas component for shopping cart
      displays list of cart items with quantity controls and remove option
      shows subtotal and checkout button
      includes checkout modal for order details
      shows notifications for actions like validation errors
    */
    <>
      <Offcanvas show={show} onHide={() => setShowCart(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shopping Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0" style={{ minWidth: 350, background: '#232629', color: '#fff' }}>
          {cartItems && cartItems.length > 0 ? (
            <>
              <ListGroup variant="flush" className="flex-grow-1" style={{ background: 'transparent' }}>
                {cartItems.map((item) => (
                  <ListGroup.Item key={item.id} className="py-3" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #444', color: '#fff' }}>
                    <Row className="align-items-center">
                      <Col xs={3}>
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fluid rounded style={{ background: '#fff', objectFit: 'cover', width: 80, height: 80 }} />
                        ) : (
                          <div style={{ width: 60, height: 60, background: "#eee", borderRadius: 8 }} />
                        )}
                      </Col>
                      <Col xs={9}>
                        <div className="fw-semibold" style={{ fontSize: '1.1rem' }}>{item.name}</div>
                        <div className="fw-bold" style={{ fontSize: '1.1rem', margin: '0.25rem 0' }}>${item.price}</div>
                        <div className="d-flex align-items-center mt-2">
                          <Button
                            variant="outline-light"
                            size="sm"
                            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, fontSize: '1.2rem', marginRight: 8, border: '1px solid #888' }}
                            onClick={() => {
                              const newQty = (item.qty || 1) - 1;
                              if (newQty < 1) {

                                deleteItemFromCart(item.id);
                                return;
                              }
                              const updatedCart = cartItems.map(ci =>
                                ci.id === item.id ? { ...ci, qty: newQty } : ci
                              );
                              saveCartToStorage(updatedCart);
                            }}
                          >
                            –
                          </Button>
                          <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.qty || 1}</span>
                          <Button
                            variant="outline-light"
                            size="sm"
                            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, fontSize: '1.2rem', marginLeft: 8, border: '1px solid #888' }}
                            onClick={() => {
                              const newQty = (item.qty || 1) + 1;
                              const updatedCart = cartItems.map(ci =>
                                ci.id === item.id ? { ...ci, qty: newQty } : ci
                              );
                              saveCartToStorage(updatedCart);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="link"
                          className="p-0 mt-2"
                          onClick={() => deleteItemFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div style={{ background: '#232629', borderTop: '2px solid #444', padding: '1.5rem 1rem 1rem 1rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
                  <span>SUBTOTAL:</span>
                  <span style={{ fontSize: '1.25rem' }}>${total}</span>
                </div>
                <Button
                  className="w-100 fw-bold checkout-btn"
                  style={{
                    fontSize: "1.15rem",
                    padding: "0.9rem 0",
                    borderRadius: "8px",
                    background: "#2196f3",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(33,150,243,0.10)",
                    letterSpacing: "1px",
                    color: '#fff',
                    transition: "background 0.2s, transform 0.2s"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#1976d2'}
                  onMouseOut={e => e.currentTarget.style.background = '#2196f3'}
                  onClick={() => setShowCheckout(true)}
                >
                  CHECKOUT
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p>Your cart is empty</p>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
      <CheckoutModal
        showCheckout={showCheckout}
        setShowCheckout={setShowCheckout}
        getOrder={getOrder}
        setOrder={setOrder}
        handleCheckout={handleCheckout}
      />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}

export default Cart;