// import necessary libraries and components
import { Offcanvas, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

// Sidebar Component for Administrator Section
function Sidebar() {
  // render the sidebar with navigation links
  return (
    /* 
      Offcanvas component for sidebar
      contains navigation links for administrator section
      has home, order management, menu management, and reservations links
    */
    <Offcanvas
      show={true}
      backdrop={false}
      scroll={true}
      
      className="sidebar-no-shadow"
      style={{ width: '15vw', height: '100vh', transition: 'none' }}
    >
      <Offcanvas.Header closeButton={false}>
        <NavLink
          to="/"
          className="offcanvas-title nav-link"
          style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none' }}
        >
          Administrator
        </NavLink>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          <Nav.Link as={NavLink} to="/administrator">
            Home
          </Nav.Link>
          <Nav.Link as={NavLink} to="/administrator/orders">
            Orders
          </Nav.Link>
          <Nav.Link as={NavLink} to="/administrator/menu">
            Menu Management
          </Nav.Link>
          <Nav.Link as={NavLink} to="/administrator/reservations">
            Reservations 
          </Nav.Link>
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Sidebar;