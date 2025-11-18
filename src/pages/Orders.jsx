// import necessary modules and components
import { useState, useEffect } from "react";
// import Needed components
import Header from "../components/Header";
import { OrdersContainer, OrderDetailsModal } from "../components/Orders";
// import storage functions
import { loadFromStorage } from "../scripts/StorageSaver";


// Main Orders component
function Orders() {
    // state variables
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // load orders from storage using useEffect
    useEffect(() => {
        // load orders from storage
        const storedOrders = loadFromStorage("orders");
        if (storedOrders) setOrders(storedOrders);
    }, []);

    // function to handle viewing order details
    function handleView(order) {
        // set selected order and show modal
        setSelectedOrder(order);
        setShowModal(true);
    }

    // render Orders page with header, orders container, and order details modal
    return (
        <div>
            <Header />
            <h1 className="mb-4 text-center">My Orders</h1>
            <OrdersContainer orders={orders} handleView={handleView} />
            <OrderDetailsModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
        </div>
    );
}

export default Orders;