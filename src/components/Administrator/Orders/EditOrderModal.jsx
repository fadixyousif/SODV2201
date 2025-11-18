// Edit Order Modal Component
import { Modal, Button, Form } from "react-bootstrap";

// Modal for editing order status
function EditOrderModal({ show, onHide, order, editStatus, setEditStatus, editReason, setEditReason, handleSaveEdit }) {
  // render the edit order modal
  return (
    /* 
        Modal for editing order status 
        displays order items in a table format and allows changing the order status
        with a dropdown for status selection and a textarea for cancellation reason for why it was cancelled
        includes buttons to close or save changes
    */
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Order Status</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {order && (
          <>
            <h5 className="mb-3">Order Items</h5>
            <div className="table-responsive mb-4">
              <table className="table table-sm table-bordered table-dark align-middle mb-0">
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
                      <td>{typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price}</td>
                      <td>{item.qty || item.quantity}</td>
                      <td>${(item.price * (item.qty || item.quantity)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  style={{ textTransform: 'capitalize' }}
                >
                  <option value="pending" disabled>Pending (auto)</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
              {editStatus === 'cancelled' && (
                <Form.Group className="mb-3">
                  <Form.Label>Reason for Cancellation</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editReason}
                    onChange={e => setEditReason(e.target.value)}
                    placeholder="Enter reason..."
                  />
                </Form.Group>
              )}
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveEdit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditOrderModal;