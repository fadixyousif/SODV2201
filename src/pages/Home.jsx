// import necessary modules and components
import { useState, useContext, useEffect } from "react";
import { Button, Badge, Container, Row, Col, Card } from 'react-bootstrap';

// import custom components and context
import Header from '../components/Header';
import Cart from '../components/Cart';
import CartContext from '../scripts/cartContext';
// import some utility functions
import { loadFromStorage } from '../scripts/StorageSaver';


function Home() {
  // state to manage cart visibility and menu items
  const [showCart, setShowCart] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  // access cart items from context
  const { cartItems } = useContext(CartContext);

  // load menu items from local storage using useEffect
  useEffect(() => {
    // Load menu items from local storage
    const menuItemsData = loadFromStorage('menuItems');

    // check if menuItemsData is an object and convert it to an array
    if (menuItemsData && typeof menuItemsData === 'object') {
      // Convert the object to an array of items
      const itemsArray = Object.entries(menuItemsData).flatMap(([category, items]) =>
        Array.isArray(items)
          ? items.map(item => ({
            ...item,
            categoryKey: category
          }))
          : []
      );

      // get the last 4 items added
      setMenuItems(itemsArray.slice(0, 4));
    }
  }, []);



  // render the Home component
  return (
    <>
      <Header />
      {/* Welcome Section */}
      <div>
        <Container>
          <h1 className="display-4 fw-bold mb-3 text-center">Welcome to Smart Restaurant</h1>
          <p className="lead text-center mb-4" style={{ maxWidth: 700, margin: '0 auto' }}>
            Experience delicious food, seamless online ordering, and smart reservations all in one place. Enjoy our chef's specials, fast service, and a modern dining experience.
          </p>
        </Container>
      </div>

      {/* Featured Menu Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Recently Added Menu Items</h2>
        <Row className="justify-content-center g-4">
          {menuItems.length === 0 ? (
            <Col xs={12} className="text-center text-muted">No menu items found.</Col>
          ) : (
            menuItems.map((item, idx) => (
              <Col xs={12} sm={6} md={4} lg={3} key={idx} className="d-flex align-items-stretch">
                <Card className="shadow-sm h-100" style={{ borderRadius: 16 }}>
                  {(item.imageUrl || item.image) && (
                    <Card.Img variant="top" src={item.imageUrl || item.image} alt={item.name} style={{ height: 180, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{item.category ? `${item.category} - ${item.name}` : item.name}</Card.Title>
                    {item.description && <Card.Text className="mb-2" style={{ flexGrow: 1 }}>{item.description}</Card.Text>}
                    <div className="fw-bold h5 mb-0">${Number(item.price).toFixed(2)}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>

      {/* Floating Cart Button */}
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

export default Home;
