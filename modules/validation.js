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
export function isMenuItemValid(name, categoryName, price, description, available) {
    // check name length between 3 and 100 characters
    if (!name || name.length < 3 || name.length > 100) {
        return { message: 'Item name must be between 3 and 100 characters', success: false };
    }

    // check categoryName is a non-empty string
    if (!categoryName || typeof categoryName !== 'string' || categoryName.trim() === '') {
        return { message: 'Invalid category name', success: false };
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
export function isOrderPlacementValid(customerName, email, phone, items, date, time) {
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

  // date validation if it's in the past return false
  if (!date || isNaN(new Date(date).getTime()) || new Date(date) < new Date()) {
      return { message: 'Invalid order date', success: false };
  }

  // time validation if it's not in HH:MM format return false
  const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
  if (!time || !timeRegex.test(time)) {
      return { message: 'Invalid order time format', success: false };
  }
  // if none of the checks failed return success
  return { success: true };
}

// reservation validation
export function isReservationValid(customerName, email, phone, reservationDate, numberOfGuests) {
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

  // check reservationDate is a valid date in the future
  const resDate = new Date(reservationDate);
  const now = new Date();
  if (isNaN(resDate.getTime()) || resDate <= now) {
      return { message: 'Reservation date must be a valid future date', success: false };
  }

  // check numberOfGuests is a positive integer
  if (isNaN(numberOfGuests) || numberOfGuests <= 0 || !Number.isInteger(numberOfGuests)) {
      return { message: 'Number of guests must be a positive integer', success: false };
  }

  // if none of the checks failed return success
  return { success: true };
}