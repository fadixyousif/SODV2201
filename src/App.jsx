// import necessary modules and components
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Button } from 'react-bootstrap';

// General Pages
import Home from './pages/Home';
import Reservations from './pages/Reservations';
import Menu from './pages/Menu';
import Orders from './pages/Orders';

// Administrator Pages
import Administrator from './pages/Administrator/Administrator';
import MenuManager from "./pages/Administrator/MenuManager";
import OrdersManager from "./pages/Administrator/OrdersManager";
import ReservationsManager from "./pages/Administrator/ReservationsManager";

// Components
import AIChatbot from './components/AIChatbot';

// cartContext
import CartContext from './scripts/cartContext';

// localstorage temporary use
import { loadFromStorage, saveToStorage } from './scripts/StorageSaver';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Main App component
function App() {
  // State to hold cart items
  const [cartItems, setCartItems] = useState([]);
  // State for Chatbot visibility
  const [showChatbot, setShowChatbot] = useState(false);
  
  // Load cart items from localStorage using useEffect
  useEffect(() => {
    // Load cart items from localStorage
    const storedCart = loadFromStorage("cartItems");
    // If there are stored cart items, set them to state
    if (Array.isArray(storedCart)) {
      setCartItems(storedCart);
    }
  }, []);

  // Function to save cart items to localStorage and update state
  function saveCartToStorage(items) {
    saveToStorage("cartItems", items);
    setCartItems(items);
  }

  // Provide CartContext to the app and set up routing
  return (
    <CartContext.Provider value={{ cartItems, saveCartToStorage, setCartItems }}>
      <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/administrator" element={<Administrator />} >
            <Route path="menu" element={<MenuManager />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="reservations" element={<ReservationsManager />} />
          </Route>
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>

        {/* Floating Chatbot Button - Global */}
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "32px",
          zIndex: 1000
        }}>
          <Button
            variant="primary"
            style={{
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              fontSize: "1.5rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              position: "relative"
            }}
            onClick={() => setShowChatbot(true)}
          >
            🤖
          </Button>
        </div>
        <AIChatbot show={showChatbot} setShow={setShowChatbot} />

      </Router>
    </CartContext.Provider>
  );
}

export default App;
