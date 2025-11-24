// import necessary modules and components
import { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Button, Dropdown } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import verifyAuth from '../scripts/verifyAuth';

// import authentication modals
import AuthModals from './AuthModals';
import { saveToStorage, loadFromStorage } from '../scripts/StorageSaver';
import '../css/Header.css';

function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  // Placeholder for user info (replace with real auth logic)
  const [userData, setUserData] = useState({});

  // Verify user authentication status on component mount
  useEffect(() => {
    async function getUserData() {
      const result = await verifyAuth();
      if (result && result.success) {
        setUserData(result.user || result.data?.user || {});
      } else {
        console.error('Error verifying user status:', result);
      }
    }
    getUserData();
  }, []);

  // render the header component
  return (
    /*
      Header component for the application
      Contains navigation links and user authentication controls
      if user is logged in, shows user dropdown with logout option
      navigation links are centered in the navbar and login is on the right
    */
    <Navbar expand="lg" className="bg-body-tertiary mb-4" style={{ minHeight: 70 }}>
      <Container fluid>
        <div style={{ flex: 1 }}></div>
        <Nav className="mx-auto justify-content-center" style={{ flex: 2 }}>
          <Nav.Link as={NavLink} to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' selected' : '')}>Home</Nav.Link>
          <Nav.Link as={NavLink} to="/menu" className={({ isActive }) => 'nav-link' + (isActive ? ' selected' : '')}>Menu</Nav.Link>
          <Nav.Link as={NavLink} to="/reservations" className={({ isActive }) => 'nav-link' + (isActive ? ' selected' : '')}>Reservations</Nav.Link>
          <Nav.Link as={NavLink} to="/orders" className={({ isActive }) => 'nav-link' + (isActive ? ' selected' : '')}>Orders</Nav.Link>
        </Nav>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {userData && Object.keys(userData).length > 0 ? (
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-user">
                {userData.fullname || "User"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {userData.role === 'administrator' && (
                  <Dropdown.Item as={NavLink} to="/admin">Admin Panel</Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => {
                  saveToStorage("authData", null);
                  window.location.reload();
                }}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Button variant="outline-primary" className="me-2" onClick={() => setShowLogin(true)}>
                Login
              </Button>
            </>
          )}
        </div>
        <AuthModals
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          showRegister={showRegister}
          setShowRegister={setShowRegister}
        />
      </Container>
    </Navbar>
  );
}

export default Header;