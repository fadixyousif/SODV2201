// import necessary modules and components
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';

// Filter Modal Component
export function FilterModal({ show, onHide, allCategories, filterCategories, setFilterCategories, priceRange, setPriceRange, priceSort, setPriceSort }) {
  // render the filter modal
  return (
    /* 
        Modal for filtering menu items based on category, price range, and sort order
        includes checkboxes for categories, input fields for price range, and radio buttons for sorting
        with buttons to close or apply the filters
    */
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Filter Menu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.1rem 0.5rem' }}>
              {allCategories.map((cat, idx) => (
                <div key={cat} style={{ flex: '0 0 15%', marginBottom: 0 }}>
                  <Form.Check
                    type="checkbox"
                    label={cat}
                    checked={filterCategories.includes(cat)}
                    onChange={e => {
                      if (e.target.checked) setFilterCategories([...filterCategories, cat]);
                      else setFilterCategories(filterCategories.filter(c => c !== cat));
                    }}
                  />
                </div>
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price Range</Form.Label>
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                style={{ maxWidth: 80 }}
              />
              <span>to</span>
              <Form.Control
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                style={{ maxWidth: 80 }}
              />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sort by Price</Form.Label>
            <div>
              <Form.Check
                inline
                label="Low to High"
                type="radio"
                name="priceSort"
                id="sort-asc"
                checked={priceSort === 'asc'}
                onChange={() => setPriceSort('asc')}
              />
              <Form.Check
                inline
                label="High to Low"
                type="radio"
                name="priceSort"
                id="sort-desc"
                checked={priceSort === 'desc'}
                onChange={() => setPriceSort('desc')}
              />
              <Form.Check
                inline
                label="None"
                type="radio"
                name="priceSort"
                id="sort-none"
                checked={priceSort === ''}
                onChange={() => setPriceSort('')}
              />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onHide}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Menu Items Component
export function MenuItems({ menuItems, addToCart }) {
  // render the menu items
  return (
    /*
      Displays a grid of menu items organized by category
      Each item includes an image, name, description, price, and availability status using cards
      if no items are found, a message is shown instead
    */
    <>
      {Object.keys(menuItems).length > 0 ? (
            <div className="p-4 mt-4 mx-auto d-flex flex-column align-items-center">
                {Object.keys(menuItems).map((category) => (
                    <div key={category} className="mb-4">
                        <h3>{category}</h3>
                        {menuItems[category].length > 0 ? (
                            <Row className="g-3" style={{ width: '80vw'}}>
                                {menuItems[category].map((item, i) => (
                                    <Col key={`${category}-${item.name}-${i}`} xs={12} sm={6} md={4} lg={3}>
                                        <Card className="h-100 shadow-sm small-menu-card">
                                            {item.imageUrl && (
                                                <Card.Img
                                                    variant="top"
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    style={{ objectFit: 'cover', height: '120px', borderRadius: '0.5rem 0.5rem 0 0' }}
                                                />
                                            )}
                                            <Card.Body className="d-flex flex-column p-2">
                                                <h6 className="mb-1 text-truncate">{item.name}</h6>
                                                <div className="mb-1 text-muted" style={{ fontSize: '0.95em' }}>{item.description}</div>
                                                <div className="mb-1"><strong>${item.price}</strong></div>
                                                <div className="d-flex align-items-center justify-content-between mt-auto">
                                                    <span className={item.available ? 'text-success' : 'text-danger'}>
                                                        {item.available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                    <Button onClick={() => addToCart(item)} disabled={!item.available}>{item.available ? 'Add to Cart' : 'Out of Stock'}</Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <p>No items available in this category.</p>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <p>No menu items found.</p>
        )}
    </>
  )
}