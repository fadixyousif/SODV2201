// import necessary modules and components
import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import axios from 'axios';
import verifyAuth from '../../scripts/verifyAuth';
import Notification from '../../components/Notification';

// import OrdersTable and EditOrderModal components
import OrdersTable from '../../components/Administrator/Orders/OrdersTable';
import EditOrderModal from '../../components/Administrator/Orders/EditOrderModal';

// OrdersManager component
function OrdersManager() {
  // state to hold orders data and editing states
  const [orders, setOrders] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editStatus, setEditStatus] = useState('preparing');
  const [editReason, setEditReason] = useState('');
  const [notification, setNotification] = useState(null);

  // load orders from API (admin-only)
  useEffect(() => {
    async function fetchOrders() {
      const authResult = await verifyAuth();
      const token = authResult?.token || null;
      if (!token) {
        setOrders([]);
        return;
      }

      try {
        const resp = await axios.get('http://localhost:5000/api/orders/all', { headers: { Authorization: `Bearer ${token}` } });
        const ordersData = resp.data?.orders || resp.data?.items || resp.data || [];
        setOrders(ordersData.map(order => ({ 
          ...order,
          date: order.date.replace('T00:00:00.000Z',''),
          time: order.time.replace('1970-01-01T','').replace('.000Z',''),
          items: JSON.parse(order.items || '[]')
          })));
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      }
    }

    fetchOrders();
  }, []);

  // function to handle editing an order
  function handleEdit(index) {
    // set the index and current status/reason for editing
    setEditIndex(index);
    // pre-fill the edit fields with current order data
    setEditStatus(orders[index].status || 'preparing');
    // if no cancel reason, set to empty string
    setEditReason(orders[index].cancelReason || '');
  }

  // function to handle saving the edited order
  function handleSaveEdit() {
    // if no order is being edited, return
    if (editIndex === null) return;
    (async () => {
      const orderId = orders[editIndex]?.id;
      const updatedOrders = [...orders];
      updatedOrders[editIndex] = {
        ...updatedOrders[editIndex],
        status: editStatus,
        cancelReason: editStatus === 'cancelled' ? editReason : ''
      };

      try {
        const authResult = await verifyAuth();
        const token = authResult?.token || null;

        if (token && orderId) {
          const payload = { status: editStatus };
          if (editStatus === 'cancelled' && editReason) payload.reason = editReason;
          await axios.put(`http://localhost:5000/api/orders/update/${orderId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        }

        // update state and save to local storage
        setOrders(updatedOrders);
        setEditIndex(null);
        setNotification({ type: 'success', message: 'Order updated successfully.' });
      } catch (error) {
        console.error('Error updating order:', error);
        const msg = error.response?.data?.message || error.message || 'Failed to update order.';
        setNotification({ type: 'danger', message: msg });
      }
    })();
  }

  // render the OrdersManager component
  return (
    <>
      <Card className="p-4 mb-4" style={{ borderRadius: '10px', border: '1.5px solid #fff', marginBottom: '2rem' }}>
        <h1>Orders</h1>
        <p>This is the Orders Management page for administrators.</p>
      </Card>
      <OrdersTable orders={orders} handleEdit={handleEdit} />
      <EditOrderModal
        show={editIndex !== null}
        onHide={() => setEditIndex(null)}
        order={editIndex !== null ? orders[editIndex] : null}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editReason={editReason}
        setEditReason={setEditReason}
        handleSaveEdit={handleSaveEdit}
      />
      {notification && (
        <Notification show={!!notification} onClose={() => setNotification(null)} type={notification.type} message={notification.message} />
      )}
    </>
  );
}

export default OrdersManager;