// import necessary modules and components
import { Card } from "react-bootstrap";

// Orders Table Component
function OrdersTable({ orders, handleEdit }) {
  // render the orders table
  return (
    /* 
        Orders Table 
        Displays a list of orders in a table format with key details
        includes columns for order ID, customer name, type, status, total, date, time, and actions
    */
    <Card className="p-4" style={{ borderRadius: '10px', border: '1.5px solid #fff', marginBottom: '2rem' }}>
      <h2 className="mb-4">Order List</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-striped align-middle">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.type}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span className={
                      order.status === 'cancelled' ? 'badge bg-danger' :
                      order.status === 'delivered' ? 'badge bg-success' :
                      order.status === 'ready' ? 'badge bg-info text-dark' :
                      order.status === 'confirmed' ? 'badge bg-primary' :
                      order.status === 'preparing' ? 'badge bg-warning text-dark' :
                      order.status === 'out-for-delivery' ? 'badge bg-secondary' :
                      order.status === 'completed' ? 'badge bg-success' :
                      'badge bg-warning text-dark'
                    } style={{ borderRadius: '8px', textTransform: 'capitalize', fontWeight: 500 }}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                    </span>
                  </td>
                  <td>${order.totalPrice?.toFixed(2)}</td>
                  <td>{order.date}</td>
                  <td>{order.time}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(index)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default OrdersTable;