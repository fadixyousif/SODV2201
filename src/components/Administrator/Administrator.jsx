// import necessary libraries and components
import { useEffect, useState } from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import axios from 'axios';
import verifyAuth from "../../scripts/verifyAuth";

// Recent Order Card Component
export function RecentOrderCard({ order }) {
  // render the recent order card
  return (
    /* 
        Recent Order Card displaying recent order details
        with customer name, order ID, date, time, type, total price, status, and item count
    */
    <Card className="h-100" style={{
      background: '#23272b',
      borderColor: '#495057',
      border: '1px solid',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: '#fff'
    }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0 fw-bold">{order.customerName}</h6>
          <Badge bg={
            order.status === 'cancelled' ? 'danger' :
            order.status === 'delivered' ? 'success' :
            order.status === 'ready' ? 'info' :
            order.status === 'confirmed' ? 'primary' :
            order.status === 'preparing' ? 'warning' :
            'secondary'
          } style={{ textTransform: 'capitalize' }}>
            {order.status || 'Pending'}
          </Badge>
        </div>
        <div className="small mb-1 opacity-75">Order #{order.id}</div>
        <div className="small mb-2 opacity-75">
          <i className="bi bi-calendar3 me-1"></i>{order.date} <i className="bi bi-clock ms-2 me-1"></i>{order.time}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="badge bg-light text-dark" style={{ textTransform: 'capitalize' }}>
            {order.type}
          </span>
          <span className="h5 mb-0 fw-bold">${order.totalPrice?.toFixed(2)}</span>
        </div>
        <div className="mt-2 small opacity-75">
          {order.items?.length || 0} item(s)
        </div>
      </Card.Body>
    </Card>
  );
}

// Recent Reservation Card Component
export function RecentReservationCard({ reservation }) {
  // render the recent reservation card
  return (
    /*
        Recent Reservation Card displaying recent reservation details
        with customer name, email, phone, date, time, guests, status, and special requests
    */
    <Card className="h-100" style={{
      background: '#23272b',
      borderColor: '#495057',
      border: '1px solid',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: '#fff'
    }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0 fw-bold">{reservation.customerName}</h6>
          <Badge bg={
            reservation.status?.response === 'pending' ? 'warning' :
            reservation.status?.response === 'confirmed' ? 'success' :
            reservation.status?.response === 'cancelled' ? 'danger' :
            'secondary'
          } style={{ textTransform: 'capitalize' }}>
            {reservation.status?.response || 'Pending'}
          </Badge>
        </div>
        <div className="small mb-1 opacity-75">{reservation.email}</div>
        <div className="small mb-1 opacity-75">{reservation.phone}</div>
        <div className="small mb-2 opacity-75">
          <i className="bi bi-calendar3 me-1"></i>{reservation.date} <i className="bi bi-clock ms-2 me-1"></i>{reservation.time}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="small opacity-75">
            <i className="bi bi-people-fill me-1"></i>{reservation.guests} guest(s)
          </span>
        </div>
        {reservation.specialRequest && (
          <div className="mt-2 small opacity-75">
            <i className="bi bi-chat-left-text me-1"></i>
            {reservation.specialRequest.length > 50 
              ? reservation.specialRequest.substring(0, 50) + '...'
              : reservation.specialRequest}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

// Menu Item Card Component
export function MenuItemCard({ item }) {
  // render the menu item card
  return (
    /* 
      Menu Item Card displaying menu item details
      with name, category, price, and description
    */
    <Card className="h-100" style={{
      background: '#23272b',
      borderColor: '#495057',
      border: '1px solid',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      overflow: 'hidden'
    }}>
      {item.imageUrl && (
        <div style={{
          height: '180px',
          overflow: 'hidden',
          background: '#000'
        }}>
          <Card.Img
            variant="top"
            src={item.imageUrl}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0 fw-bold text-white">{item.category} - {item.name}</h6>
          <span className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </span>
        </div>
        <p className="small text-muted mb-0" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {item.description || 'No description available.'}
        </p>
      </Card.Body>
    </Card>
  );
}

// Administrator Dashboard Component
export function Administrator() {
  // state to hold dashboard data
  const [dashboardData, setDashboardData] = useState({
    recentOrders: [],
    recentReservations: [],
    newestMenuItems: []
  });

  // useEffect to load dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      const authResult = await verifyAuth();
      const token = authResult?.token || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // Always fetch menu items from API
        const menuResp = await axios.get("http://localhost:5000/api/menu/items");

        const categories = {};
        for (const item of (menuResp.data.items || menuResp.data || [])) {
          if (!categories[item.category]) categories[item.category] = [];
          categories[item.category].push(item);
        }

        const allMenuItems = [];
        Object.keys(categories).forEach(category => {
          categories[category].forEach(item => {
            allMenuItems.push({ ...item, category });
          });
        });
        const newestMenuItems = allMenuItems.slice(-6).reverse();

        // Fetch orders/reservations only when authenticated
        let recentOrders = [];
        let recentReservations = [];
        if (token) {
          // fetch orders and reservations
          const ordersResp = await axios.get("http://localhost:5000/api/orders/all", { headers });
          const reservationsResp = await axios.get("http://localhost:5000/api/reservations/all", { headers });

          // extract orders and reservations data
          const orders = ordersResp.data?.orders || ordersResp.data?.items || ordersResp.data || [];
          let reservations = reservationsResp.data?.reservations || reservationsResp.data?.items || reservationsResp.data || [];

          // Convert order status since database use status_ fields instead of status object
          reservations = reservations.map(r => ({
            ...r,
            status: r.status && typeof r.status === 'object'
              ? r.status
              : (r.status_response ? { response: r.status_response, reason: r.status_reason } : r.status)
          }));

          recentOrders = orders.slice(-5).reverse();
          recentReservations = reservations.slice(-5).reverse();
        }

        // update dashboard data state
        setDashboardData({
          recentOrders,
          recentReservations,
          newestMenuItems
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData({
          recentOrders: [],
          recentReservations: [],
          newestMenuItems: []
        });
      }
    }

    fetchDashboard();
  }, []);

  // render the administrator dashboard
  return (
    /* 
      Administrator Dashboard displaying recent orders, reservations, and newest menu items
      uses RecentOrderCard, RecentReservationCard, and MenuItemCard components
    */
    <>
      <Card className="p-4 mb-4" style={{ borderRadius: '10px', border: '1.5px solid #fff' }}>
        <h1 className="mb-2">Administrator Dashboard</h1>
        <p className="text-muted mb-0">Welcome to the admin panel. Here's an overview of your recent activity.</p>
      </Card>

      {/* Recent Orders Section */}
      <Card className="p-4 mb-4" style={{ borderRadius: '10px', border: '1.5px solid #dee2e6' }}>
        <h3 className="mb-3">
          <i className="bi bi-bag-check-fill me-2"></i>Recent Orders
        </h3>
        {dashboardData.recentOrders.length === 0 ? (
          <p className="text-muted">No recent orders.</p>
        ) : (
          <Row className="g-3">
            {dashboardData.recentOrders.map((order, index) => (
              <Col key={index} xs={12} md={6} lg={4}>
                <RecentOrderCard order={order} />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Recent Reservations Section */}
      <Card className="p-4 mb-4" style={{ borderRadius: '10px', border: '1.5px solid #dee2e6' }}>
        <h3 className="mb-3">
          <i className="bi bi-calendar-check-fill me-2"></i>Recent Reservations
        </h3>
        {dashboardData.recentReservations.length === 0 ? (
          <p className="text-muted">No recent reservations.</p>
        ) : (
          <Row className="g-3">
            {dashboardData.recentReservations.map((reservation, index) => (
              <Col key={index} xs={12} md={6} lg={4}>
                <RecentReservationCard reservation={reservation} />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Newest Menu Items Section */}
      <Card className="p-4 mb-4" style={{ borderRadius: '10px', border: '1.5px solid #dee2e6' }}>
        <h3 className="mb-3">
          <i className="bi bi-star-fill me-2"></i>Newest Menu Items
        </h3>
        {dashboardData.newestMenuItems.length === 0 ? (
          <p className="text-muted">No menu items available.</p>
        ) : (
          <Row className="g-3">
            {dashboardData.newestMenuItems.map((item, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={4}>
                <MenuItemCard item={item} />
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </>
  );
}

export default Administrator;