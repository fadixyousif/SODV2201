// import necessary libraries and components
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

// import Notification component
import Notification from "./Notification";

// import storage helper functions
import { saveToStorage } from "../scripts/StorageSaver";

function AuthModals({ showLogin, setShowLogin, showRegister, setShowRegister }) {

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

    axios.post("http://localhost:5000/api/auth/login", {
      email: loginEmail,
      password: loginPassword
    })
    .then(response => {
      const data = response.data;
      if (data.success) {
        // Successful login
        setNotification({
          type: "success",
          message: "Login successful!",
        });

        // Save auth token to local storage
        saveToStorage("authData", {
          token: data.token,
        });
        // Close login modal
        setShowLogin(false);
      } else {
        // Login failed
        setNotification({
          type: "danger",
          message: data.message || "Login failed. Please try again.",
        });
      }
    })
    .catch(error => {
      console.error("Login error:", error);
      // Axios attaches the server response (for non-2xx) on `error.response`
      if (error.response) {
        const { status, data } = error.response;
        // Prefer server-provided message if available
        const serverMessage = data && (data.message || data.error || JSON.stringify(data));
        const message = serverMessage || "An error occurred. Please try again.";
        if (status === 401 || status === 400) {
          // Unauthorized (401) - show server message
          setNotification({ type: "danger", message });
          return;
        }
        // Generic server error handling
        setNotification({ type: "danger", message });
      }
      else if (error.request) {
        // Request made but no response received
        setNotification({ type: "danger", message: "No response from server. Check your network." });
      }
      else {
        // Something else happened
        setNotification({ type: "danger", message: "An unexpected error occurred. Please try again." });
      }
    });
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

  /* {
	"message": "User with this email already exists",
	"success": false
}*/

  function handleRegister(e) {
    // Prevent form submission
    e.preventDefault();
    // Validate registration form
    if (!validateRegister()) return;

    axios.post("http://localhost:5000/api/auth/register", {
      fullname: registerName,
      email: registerEmail,
      password: registerPassword
    })
    .then(response => {
      const data = response.data;
      if (data.success) {
        // Successful registration
        setNotification({
          type: "success",
          message: "Registration successful!",
        });
        // Close register modal and open login modal
        setShowRegister(false);
        setShowLogin(true);
      } else {
        // Registration failed
        setNotification({
          type: "danger",
          message: data.message || "Registration failed. Please try again.",
        });
      }
    })
    .catch(error => {
      console.error("Registration error:", error);
      // Axios attaches the server response (for non-2xx) on `error.response`
      if (error.response) {
        const { status, data } = error.response;
        // Prefer server-provided message if available
        const serverMessage = data && (data.message || data.error || JSON.stringify(data));
        const message = serverMessage || "An error occurred. Please try again.";
        if (status === 409 || status === 500 || status === 400) {
          // Conflict (409) - show server message
          setNotification({ type: "danger", message });
          return;
        }
        // Generic server error handling
        setNotification({ type: "danger", message });
      } else if (error.request) {
        // Request made but no response received
        setNotification({ type: "danger", message: "No response from server. Check your network." });
      } else {
        // Something else happened while setting up the request
        setNotification({ type: "danger", message: "An error occurred. Please try again." });
      }
    });
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
