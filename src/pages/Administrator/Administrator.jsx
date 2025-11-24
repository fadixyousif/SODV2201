// import necessary modules and components
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";

// import custom components
import Sidebar from "../../components/Administrator/Sidebar";
import AdministratorComp from "../../components/Administrator/Administrator";

// import storage utility functions
import verifyAuth from "../../scripts/verifyAuth";


export default function Administrator() {
  // path location check if at root admin page
  const location = useLocation();
  const isRootAdmin = location.pathname === "/administrator";
  // state to manage loading and authentication
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect to check authentication status
  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const [result] = await Promise.all([
          verifyAuth(),
          new Promise((r) => setTimeout(r, 1000))
        ]);
        const user = result?.user || result?.data?.user || null;
        const isAdmin = result && result.success && (user?.role === 'administrator' || user?.role === 'admin');
        if (mounted) {
          setIsAuthenticated(!!isAdmin);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    }
    checkAuth();
    return () => { mounted = false; };
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