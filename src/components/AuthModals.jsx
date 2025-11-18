// import necessary libraries and components
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

// import Notification component
import Notification from "./Notification";

// import storage helper functions
import { saveToStorage, loadFromStorage } from "../scripts/StorageSaver";

function AuthModals({ showLogin, setShowLogin, showRegister, setShowRegister }) {
  // Load authentication data
  const authData = loadFromStorage("authData") || { };

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");

  // Notification state
  const [notification, setNotification] = useState(null);

  function validateLogin() {
    const errors = [];
    if (!loginEmail) errors.push("Email is required.");
    if (!loginPassword) errors.push("Password is required.");

    // check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(loginEmail)) {
      errors.push("Invalid email format.");
    }

    if (errors.length > 0) {
      setNotification({
        type: "danger",
        message: errors.join(",\n"),
      });
    }

    return errors.length === 0;
  }

  function handleLogin(e) {
    // Prevent form submission
    e.preventDefault();
    // Validate login form
    if (!validateLogin()) return;

    // check credentials
    console.log('registerEmail:', registerEmail);
    console.log('registerPassword:', registerPassword);
    if (registerEmail === loginEmail && registerPassword === loginPassword) {
        console.log("Logging in with temporary registered user");
        // Successful login
        setNotification({
        type: "success",
        message: "Login successful!",
      });
      // Save current user
      saveToStorage("currentUser", {
        email: loginEmail,
        name: registerName,
      });
      // Close login modal
      setShowLogin(false);
    }
  }

  function validateRegister() {
    const errors = [];

    // check required fields
    if (!registerName) errors.push("Name is required.");
    if (!registerEmail) errors.push("Email is required.");
    if (!registerPassword) errors.push("Password is required.");

    // check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(registerEmail)) {
        errors.push("Invalid email format.");
    }

    // check password length
    if (registerPassword.length < 6) {
        errors.push("Password must be at least 6 characters long.");
    }

    // check if user already exists
    if (authData[registerEmail]) {
        errors.push("User already exists.");
    }

    // Set notification
    if (errors.length > 0) {
        setNotification({
            type: "danger",
            message: errors.join(",\n"),
        });
    }

    // Return validation result
    return errors.length === 0;
  }

  function handleRegister(e) {
    // Prevent form submission
    e.preventDefault();
    // Validate registration form
    if (!validateRegister()) return;

    // notify success
    setNotification({
        type: "success",
        message: "Registration successful!",
    });

    // Close register modal and open login modal
    setShowRegister(false);
    setShowLogin(true);
  }

  return (
    <>
      {/* Login Modal */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100 mb-2">Login</Button>
          </Form>
          <div className="text-center mt-2">
            <span>Don't have an account? </span>
            <Button variant="link" onClick={() => { setShowLogin(false); setShowRegister(true); }}>
              Sign Up
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {/* Register Modal */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="success" className="w-100 mb-2">Sign Up</Button>
          </Form>
          <div className="text-center mt-2">
            <span>Already have an account? </span>
            <Button variant="link" onClick={() => { setShowRegister(false); setShowLogin(true); }}>
              Login
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </>
  );
}

export default AuthModals;
