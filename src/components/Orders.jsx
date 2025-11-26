// import necessary modules and components
import { Card, Button, Modal, Table, Badge, Container, Row, Col } from "react-bootstrap";

// Orders Container Component
export function OrdersContainer({ orders, handleView }) {
    // render the orders container
    return (
        /* 
            Orders List Container 
            Displays a list of orders in a responsive grid layout then
            each order is shown in a card with key details and a button to view more information
        */
        <Container className="mb-4">
            <Row className="justify-content-center g-4">
                {orders.length === 0 ? (
                    <Col xs={12}><p>No orders found.</p></Col>
                ) : (
                    orders.map((order, idx) => (
                        <Col xs={12} sm={6} md={4} lg={3} className="d-flex align-items-stretch" key={order.id || idx}>
                            <Card style={{ width: '100%' }} className="shadow-sm h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="mb-2">Order #{order.id}</Card.Title>
                                    <div className="mb-2">
                                        <Badge bg={
                                            order.status === 'cancelled' ? 'danger' :
                                            order.status === 'delivered' ? 'success' :
                                            order.status === 'ready' ? 'info' :
                                            order.status === 'confirmed' ? 'primary' :
                                            order.status === 'preparing' ? 'warning' :
                                            order.status === 'out-for-delivery' ? 'secondary' :
                                            order.status === 'completed' ? 'success' :
                                            'warning'
                                        } style={{ textTransform: 'capitalize' }}>
                                            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                        </Badge>
                                    </div>
                                    {order.status === 'cancelled' && order.cancelReason && (
                                        <div className="mt-2 text-danger" style={{ fontSize: '0.95em' }}>
                                            <strong>Reason:</strong> {order.cancelReason}
                                        </div>
                                    )}
                                    <div><strong>Date:</strong> {order.date}</div>
                                    <div><strong>Total:</strong> ${order.totalPrice?.toFixed(2)}</div>
                                    <Button
                                        variant="outline-primary"
                                        className="w-100"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => handleView(order)}
                                    >
                                        View Details
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
}

// Order Details Modal Component
export function OrderDetailsModal({ show, onHide, order }) {
    // render the order details modal
    return (
        /* 
            Modal to display detailed information about a specific order 
            including items, quantities, prices, and overall order details
            if no order is selected, nothing is shown
        */
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Order Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {order && (
                    <>
                        <div className="mb-2"><strong>Order ID:</strong> {order.id}</div>
                        <div className="mb-2"><strong>Status:</strong> {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}</div>
                        <div className="mb-2"><strong>Date:</strong> {order.date}</div>
                        <div className="mb-2"><strong>Type:</strong> {order.type}</div>
                        <div className="mb-2"><strong>Total:</strong> ${order.totalPrice?.toFixed(2)}</div>
                        <h5 className="mt-4 mb-3">Items</h5>
                        <Table bordered hover size="sm" className="bg-dark text-light">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td>{typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : (typeof item.price === 'string' ? `$${parseFloat(item.price).toFixed(2)}` : '-')}</td>
                                        <td>{item.qty || item.quantity}</td>
                                        <td>{
                                            typeof item.price === 'number' && (item.qty || item.quantity)
                                                ? `$${(item.price * (item.qty || item.quantity)).toFixed(2)}`
                                                : (typeof item.price === 'string' && (item.qty || item.quantity))
                                                    ? `$${(parseFloat(item.price) * (item.qty || item.quantity)).toFixed(2)}`
                                                    : '-'
                                        }</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
