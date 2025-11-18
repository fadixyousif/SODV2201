// import necessary modules and components
import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

// import OrdersTable and EditOrderModal components
import OrdersTable from '../../components/Administrator/Orders/OrdersTable';
import EditOrderModal from '../../components/Administrator/Orders/EditOrderModal';

// import storage utility functions
import { saveToStorage, loadFromStorage } from '../../scripts/StorageSaver';

// OrdersManager component
function OrdersManager() {
  // state to hold orders data and editing states
  const [orders, setOrders] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editStatus, setEditStatus] = useState('preparing');
  const [editReason, setEditReason] = useState('');

  // load orders from local storage using useEffect
  useEffect(() => {
    // Load orders from local storage
    const orders = loadFromStorage("orders");

    // if orders exist, set them to state
    if (orders) {
      setOrders(orders);
    }
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
    // update the specific order with new status and reason
    const updatedOrders = [...orders];
    // update the order at editIndex with new status and reason
    updatedOrders[editIndex] = {
      ...updatedOrders[editIndex],
      status: editStatus,
      cancelReason: editStatus === 'cancelled' ? editReason : ''
    };
    // update state and save to local storage
    setOrders(updatedOrders);
    saveToStorage('orders', updatedOrders);
    // reset editing states
    setEditIndex(null);
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
    </>
  );
}

export default OrdersManager;