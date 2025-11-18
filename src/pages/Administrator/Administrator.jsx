// import necessary modules and components
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";

// import custom components
import Sidebar from "../../components/Administrator/Sidebar";
import AdministratorComp from "../../components/Administrator/Administrator";

// import storage utility functions
import { loadFromStorage } from "../../scripts/StorageSaver";


export default function Administrator() {
  // path location check if at root admin page
  const location = useLocation();
  const isRootAdmin = location.pathname === "/administrator";
  // state to manage loading and authentication
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect to check authentication status
  useEffect(() => {
    // simulate loading delay
    const timer = setTimeout(() => {
      // check for authentication data in local storage
      const authData = loadFromStorage("currentUser");
      // set authentication state based on presence of authData
      if (!authData) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
      // set loading to false after check
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // render loading spinner if still loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // redirect to home if not authenticated
  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  // render the Administrator component
  return (
    <div>
      <Container fluid className="mt-3">
        <Row>
          <Col lg={2} className="d-none d-lg-block">
            <Sidebar />
          </Col>
          <Col xs={12} lg={9}>
            {isRootAdmin ? <AdministratorComp /> : <Outlet />}
          </Col>
        </Row>
      </Container>
    </div>
  );
}