// import necessary modules and components
import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

// import custom components
import Notification from '../../Notification';

// Edit Menu Item Modal Component
function EditMenuItemModal({ show, onHide, item, removeMenuItem, editMenuItem }) {
  // state to manage form inputs
  const [form, setForm] = useState({ ...item });

  // state to manage notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '', // 'success' or 'error'
  });

  // update form state when item prop changes
  useEffect(() => {
    setForm({ ...item });
  }, [item]);

  // handle input changes
  const handleChange = (e) => {
    // handle input changes
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  function formValidation() {
    // array to hold error messages
    const errors = [];

    // validate each field
    if (!form.name) errors.push('Name is required');
    if (!form.category) errors.push('Category is required');
    if (!form.price) errors.push('Price is required');
    if (form.price <= 0) errors.push('Price must be positive');
    if (!form.description) errors.push('Description is required');
    if (!form.imageUrl) errors.push('Image URL is required');
    // return errors as an array
    return errors;
  }
  // handle form submission
  const handleSubmit = (e) => {
    // handle form submission logic here
    e.preventDefault();

    const errors = formValidation();
    if (errors.length > 0) {
      // prepare error message
      let errorMessage = 'Please fix the following errors:\n';
      // loop through each error message
      for (const message of errors) {
        errorMessage += `- ${message}\n`;
      }
      // set warning message
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error',
      });
      return;
    }

    // call editMenuItem with updated form data
    editMenuItem(form);

    // hide the modal
    onHide();
  };

  // handle delete action
  const handleDelete = () => {
    // call removeMenuItem with the current item
    removeMenuItem(item);

    // hide the modal
    onHide();
  };

  // render the modal
  return (
    /* 
      Modal for editing a menu item
      includes form fields for name, category, price, description, image URL, and availability
      with buttons to cancel, delete, or save changes with if statements for validation and error handling
    */
   <>
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Menu Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={form.category || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price || ''}
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
                value={form.description || ''}
                onChange={handleChange}
                rows={2}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={form.imageUrl || ''}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="availableCheckbox">
              <Form.Check
                type="checkbox"
                name="available"
                label="Available"
                checked={!!form.available}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleDelete} type="button">
              Delete
            </Button>
            <Button variant="secondary" onClick={onHide} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Notification 
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
   </>
  );
}

export default EditMenuItemModal;
