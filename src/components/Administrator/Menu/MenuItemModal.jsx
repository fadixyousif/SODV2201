// Menu Item Modal Component
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

// Modal for adding a new menu item
function MenuItemModal({ show, onHide, addMenuItem, menuItems, setNotification }) {
  // state to manage form inputs
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    available: true,
  });

  // simple form validation
  function formValidation() {
    // array to hold error messages
    const errors = [];

    // validate each field
    if (!form.name) errors.push('Name is required');
    if (!form.category && !menuItems[form.category]) errors.push('Category is required');
    if (!form.price) errors.push('Price is required');
    if (form.price <= 0) errors.push('Price must be positive');
    if (!form.description) errors.push('Description is required');
    if (!form.imageUrl) errors.push('Image URL is required');
    // return errors as an array
    return errors;
  }

  // handle input changes
  const handleChange = (e) => {
    // handle input changes
    const { name, value, type, checked } = e.target;
    // update form state
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    const errors = formValidation();
    if (errors.length > 0) {
      // prepare error message
      let errorMessage = 'Please fix the following errors:\n';
      // loop through each error message
      for (const message of errors) {
        errorMessage += `- ${message}\n`;
      }
      
      // set notification message
      setNotification({ type: 'danger', message: errorMessage });
      return;
    }

    // add the new menu item
    addMenuItem(form);
    // reset form state
    setForm({
      name: '',
      category: '',
      price: '',
      description: '',
      imageUrl: '',
      available: true,
    });
    // hide the modal
    onHide();
  };

  // render the modal
  return (
    /* 
      Modal for adding a new menu item
      includes form fields for name, category, price, description, image URL, and availability
      with buttons to cancel or add the item uses if statements for validation and error handling 
    */
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add Menu Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {Object.keys(menuItems).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="availableCheckbox">
            <Form.Check
              type="checkbox"
              name="available"
              label="Available"
              checked={form.available}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default MenuItemModal;