// import necessary modules and components
import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Spinner } from 'react-bootstrap';
import Notification from "../components/Notification";
// import Needed components
import Header from "../components/Header";
import { OrdersContainer, OrderDetailsModal } from "../components/Orders";

// import custom auth check function
import verifyAuth from "../scripts/verifyAuth";

// Main Orders component
function Orders() {
    // state to manage user authentication
    const [isUserAuthenticated, setIsUserAuthenticated] = useState({
        success: false,
        token: ""
    });

    // state variables
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [publicOrderId, setPublicOrderId] = useState("");
    const [notification, setNotification] = useState(false);

    // load orders from storage using useEffect
    useEffect(() => {
        // function to load user's orders
        async function loadMyOrders() {
            // verify user authentication
            const authStatus = await verifyAuth();

            // update authentication state
            setIsUserAuthenticated(authStatus);

            // if authenticated, fetch user's orders
            if (authStatus.success) {
                try {
                    const response = await axios.get("http://localhost:5000/api/orders/myorders", {
                        headers: { Authorization: `Bearer ${authStatus.token}` }
                    });
                    setOrders(response.data.orders.map(order => ({
                        id: order.id,
                        customerName: order.customerName,
                        date: order.date.replace('T00:00:00.000Z','') + ' ' + order.time.replace('1970-01-01T','').replace('.000Z',''),
                        type: order.type,
                        status: order.status,
                        totalPrice: order.totalPrice,
                        items: JSON.parse(order.items || '[]')
                    })) || []);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                }
            }
        }
        loadMyOrders();
    }, []);

    // function to handle viewing order details
    function handleView(order) {
        // set selected order and show modal
        setSelectedOrder(order);
        setShowModal(true);
    }

    async function fetchPublicOrder(e) {
        e.preventDefault();
        if (!publicOrderId) { setNotification({ message: 'Please enter an order ID.', type: 'danger' }); return; }
            try {
                const resp = await axios.get(`http://localhost:5000/api/orders/id/${encodeURIComponent(publicOrderId)}`);
                const order = resp.data.order || resp.data.data || resp.data;
                if (!order) {
                    setNotification({ message: 'Order not found.', type: 'danger' });
                    setOrders([]);
                } else {
                    setOrders([
                        {
                            id: order.id,
                            customerName: order.customerName,
                            date: order.date.replace('T00:00:00.000Z','') + ' ' + order.time.replace('1970-01-01T','').replace('.000Z',''),
                            type: order.type,
                            status: order.status,
                            totalPrice: order.totalPrice,
                            items: JSON.parse(order.items || '[]')
                        }
                    ]);  
                    setNotification({ message: 'Order fetched.', type: 'success' });
                }
            } catch (error) {
                console.error('Public order fetch error:', error);
                if (error.response) {
                    setNotification({ message: error.response.data?.message || JSON.stringify(error.response.data), type: 'danger' });
                } else if (error.request) {
                    setNotification({ message: 'No response from server. Check your network.', type: 'danger' });
                } else {
                    setNotification({ message: error.message || 'An unexpected error occurred.', type: 'danger' });
                }
                setOrders([]);
            }
    }
    // render Orders page with header, orders container, and order details modal
    return (
        <div>
            <Header />
            {!isUserAuthenticated.success && (
                <div className="container mt-3 mb-3">
                    <h5 className="text-center">Lookup an order</h5>
                    <Form onSubmit={fetchPublicOrder} className="d-flex justify-content-center align-items-center gap-2">
                        <Form.Control type="text" placeholder="Enter order ID" value={publicOrderId} onChange={(e) => setPublicOrderId(e.target.value)} style={{ maxWidth: 360 }} />
                        <Button type="submit" variant="primary">
                            Lookup Order
                        </Button>
                        <Button variant="outline-secondary" onClick={() => { setPublicOrderId(''); setOrders([]); setNotification(false); }}>Clear</Button>
                    </Form>
                </div>
            )}
            <h1 className="mb-4 text-center">My Orders</h1>
            {notification && (
                <Notification message={notification.message} type={notification.type} show={!!notification} onClose={() => setNotification(false)} />
            )}
            <OrdersContainer orders={orders} handleView={handleView} />
            <OrderDetailsModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
        </div>
    );
}

export default Orders;