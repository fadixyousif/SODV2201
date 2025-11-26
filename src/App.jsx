// import necessary modules and components
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
      </Router>
    </CartContext.Provider>
  );
}

export default App;
