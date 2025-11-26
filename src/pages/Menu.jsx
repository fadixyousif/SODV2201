// import necessary modules and components
import { useState, useEffect, useContext } from "react";
import { Button, Badge } from 'react-bootstrap';
import axios from "axios";

// import Needed components
import Header from "../components/Header";
import Cart from "../components/Cart";
import CartContext from "../scripts/cartContext";
import { MenuItems, FilterModal } from "../components/Menu";

// import storage functions
import { loadFromStorage } from "../scripts/StorageSaver";

// Main Menu component
function Menu() {
  // state variables
  const [menuItems, setMenuItems] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategories, setFilterCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [priceSort, setPriceSort] = useState('');

  // cart context
  const { cartItems, saveCartToStorage} = useContext(CartContext);

  // function to add item to cart
  function addToCart(item) {
    // Add item to cart and save to storage
    const updatedCart = [...cartItems, item];
    saveCartToStorage(updatedCart);
  }

  // load menu items from storage using useEffect
  useEffect(() => {
    // GET /api/menu/items
    // load menu items from storage
    const categories = {}
    axios.get("http://localhost:5000/api/menu/items")
      .then(response => {
        for (const item of response.data.items) {
          if (!categories[item.category]) {
            categories[item.category] = [];
          }
          categories[item.category].push(item);
        }
        setMenuItems(categories);
      })
      .catch(error => {
        console.error("Error fetching menu items:", error);
      });
  }, []);

  // Filter logic
  const filteredMenu = Object.keys(menuItems).reduce((acc, cat) => {
    // Category filter
    if ((category && cat !== category) || (filterCategories.length > 0 && !filterCategories.includes(cat))) return acc;
    let filteredItems = menuItems[cat].filter(item =>
      (!search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.description && item.description.toLowerCase().includes(search.toLowerCase())))
    );
    // Price range filter
    filteredItems = filteredItems.filter(item => {
      const minOk = priceRange.min === '' || item.price >= Number(priceRange.min);
      const maxOk = priceRange.max === '' || item.price <= Number(priceRange.max);
      return minOk && maxOk;
    });
    // Price sort
    if (priceSort === 'asc') filteredItems.sort((a, b) => a.price - b.price);
    if (priceSort === 'desc') filteredItems.sort((a, b) => b.price - a.price);

    if (filteredItems.length > 0) acc[cat] = filteredItems;
    return acc;
  }, {});

  // Get all categories for dropdown
  const allCategories = Object.keys(menuItems);

  // render Menu page with header, menu items, filter modal, and cart
  return (
    <>
        <Header />
        <div className="text-center">
            <h1>Menu Page</h1>
        </div>
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3 mb-2">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 250 }}
            placeholder="Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="outline-primary" onClick={() => setShowFilter(true)}>
            Filters
          </Button>
        </div>
        <MenuItems menuItems={filteredMenu} addToCart={addToCart} />
        <FilterModal show={showFilter} onHide={() => setShowFilter(false)} allCategories={allCategories} filterCategories={filterCategories} setFilterCategories={setFilterCategories} priceRange={priceRange} setPriceRange={setPriceRange} priceSort={priceSort} setPriceSort={setPriceSort} />
        <div style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 1000
        }}>
          <Button
            variant="success"
            style={{
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              fontSize: "1.5rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              position: "relative"
            }}
            onClick={() => setShowCart(true)}
          >
            {/* Badge for cart count */}
            {cartItems.length > 0 && (
              <Badge
                bg="danger"
                pill
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "-8px",
                  fontSize: "1rem",
                  padding: "0.4em 0.7em"
                }}
              >
                {cartItems.length}
              </Badge>
            )}
            🛒
          </Button>
        </div>
        <Cart show={showCart} setShowCart={setShowCart} />
    </>
  );
}
export default Menu;