export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// register validation
export function isRegisterationValid(fullname, password, email) {

  // check fullname length is between 4 and 20 characters
  if (fullname.length < 4 || fullname.length > 20) {
    return { message: 'Full name must be between 4 and 20 characters', success: false }
  }

  // check if not email is not valid
  if (!isValidEmail(email)) {
    return { message: 'Invalid email format', success: false }
  }

  // check if fullname does not contains characters that are not allowed
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(fullname)) {
    return { message: 'Full name must contain only letters and spaces', success: false }
  }

  // check if password length is not between 8 and 20 characters
  if (password.length < 8 || password.length > 20) {
    return { message: 'Password must be between 8 and 20 characters', success: false }
  }

  return { success: true };
}

// menu item validation
export function isMenuItemValid(name, categoryId, price, description, available) {
    // check name length between 3 and 100 characters
    if (!name || name.length < 3 || name.length > 100) {
        return { message: 'Item name must be between 3 and 100 characters', success: false };
    }

    // check categoryId is a positive integer
    if (isNaN(categoryId) || categoryId <= 0) {
        return { message: 'Invalid category ID', success: false };
    }

    // check price if it's not a number or negative
    if (isNaN(price) || price < 0) {
        return { message: 'Price must be a non-negative number', success: false };
    }

    // check description length if provided
    if (description && description.length > 500) {
        return { message: 'Description cannot exceed 500 characters', success: false };
    }

    // check available is a boolean
    if (typeof available !== 'boolean') {
        return { message: 'Available must be a boolean value', success: false };
    }

    return { success: true };
}

// Order placement validation
export function isOrderPlacementValid(customerName, email, phone, items) {
  // check customerName length between 3 and 100 characters
  if (!customerName || customerName.length < 3 || customerName.length > 100) {
      return { message: 'Customer name must be between 3 and 100 characters', success: false };
  }

  // check email format
  if (!isValidEmail(email)) {
      return { message: 'Invalid email format', success: false };
  }
  // check phone number format
  const phoneRegex = /^[0-9+\-\s()]{7,30}$/;
  if (!phone || !phoneRegex.test(phone)) {
      return { message: 'Invalid phone number format', success: false };
  }

  // check items is a non-empty array
  if (!Array.isArray(items) || items.length === 0) {
      return { message: 'Order must contain at least one item', success: false };
  }

  // if none of the checks failed return success
  return { success: true };
}