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
    if (!name || name.length < 3 || name.length > 100) {
        return { message: 'Item name must be between 3 and 100 characters', success: false };
    }
    if (isNaN(categoryId) || categoryId <= 0) {
        return { message: 'Invalid category ID', success: false };
    }

    if (isNaN(price) || price < 0) {
        return { message: 'Price must be a non-negative number', success: false };
    }

    if (description && description.length > 500) {
        return { message: 'Description cannot exceed 500 characters', success: false };
    }

    if (typeof available !== 'boolean') {
        return { message: 'Available must be a boolean value', success: false };
    }
    return { success: true };
}