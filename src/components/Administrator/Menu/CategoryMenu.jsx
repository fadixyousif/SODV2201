// import necessary components from react-bootstrap
import { useState } from 'react';
import { Modal, Button, Form, Card } from 'react-bootstrap';

function CategoryMenu({ show, onHide, setShowCategoryModal, addCategory, menuItems, setWarning, removeCategory }) {
  // state to manage new category name input
  const [categoryName, setCategoryName] = useState('');
  
  function validateCategoryName(name) {
    // simple validation: non-empty and not already existing
    if (!name.trim()) {
      // set warning for empty category name
      setWarning('Category name cannot be empty.');
      return false;
    }

    // check for duplicate category
    if (menuItems[name]) {
      // set warning for duplicate category
      setWarning('Category already exists.');
      return false;
    }

    // validation passed
    return true;
  }

  // handle adding a new category
  function handleAddCategory() {
    if (!validateCategoryName(categoryName)) {
      return;
    }

    // clear any existing warnings
    setWarning('');
    addCategory(categoryName);
    setCategoryName('');
  };

  // handle removing a category
  function handleRemoveCategory(category) {
    // ensure category exists before removing
    if (!menuItems[category]) {
      return;
    }
    // remove the category
    removeCategory(category);
    onHide();
  }

  // render the category management modal
  return (
    /* 
        Modal for managing categories
       includes form to add new category and list of existing categories with remove buttons
    */
      <Modal show={show} onHide={onHide}>
        <Modal.Header>
          <Modal.Title>Category Management</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  setWarning('');
                }}
                autoFocus
              />
            </Form.Group>
          </Form>
          <Button onClick={handleAddCategory}>Add Category</Button>
        </Modal.Body>
        <Modal.Body>
        <h4>Available Categories</h4>
        {/* use cards for available categories since remove will be added make button to the right */}
        {Object.keys(menuItems).length > 0 ? Object.keys(menuItems).map((category) => (
          <Card key={category} className="mb-2">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <span>{category}</span>
              <Button variant="danger" size="sm" onClick={() => handleRemoveCategory(category)}>
                Remove
              </Button>
            </Card.Body>
          </Card>
        )) : (
          <p>No categories available.</p>
        )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  );
}

export default CategoryMenu;