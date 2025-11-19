// import required modules
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sql from 'mssql';

// import custom modules
import {
    verifyToken,
    hashPassword
} from './modules/authentication.js';

import {
    isRegisterationValid,
    isValidEmail,
    isMenuItemValid,
    isOrderPlacementValid
} from './modules/validation.js';

import {
    registerCheckUserExists,
    categoriesDuplicateCheck,
    checkCategoryExists,
    isAdministrator,
    hasMenuItems,
} from './modules/queries.js';

// SQL Server config
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: { encrypt: false }
};


// connect to SQL Server
sql.connect(dbConfig)
  .then(() => console.log("SQL Server connected"))
  .catch(err => console.error(err));

// create an express application
const app = express();
 
// enable CORS and JSON parsing middleware
app.use(cors())
app.use(express.json());


// POST request to register a new user
app.post('/api/auth/register', async (req, res) => {
    /*
     get fullname, email, and password from request body
     if body has no json or missing fields, return 400 error
    */
    const { fullname, email, password } = req.body || {};

    // Check if all fields are provided
    if (!fullname || !email || !password) {
        return res.status(400).json({ 
            error: "All fields are required", 
            success: false 
        });
    }

    // validate registration data
    const validationResult = isRegisterationValid(fullname, password, email);
    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    // generate a random salt and hash the password using crypto module
    const salt = crypto.randomBytes(16).toString('hex');
    // hash the password using PBKDF2 algorithm with the generated salt
    const hashedPassword = hashPassword(password, salt);

    // use try-catch to handle database operations
    try {
        // check if user with the same email already exists
		if (await registerCheckUserExists(sql, email)) {
			return res.status(409).json({
				message: "User with this email already exists",
				success: false
			});
		}

        // insert the new user into the database
		const result = await sql.query`
        INSERT INTO accounts (fullname, email, password, salt)
        VALUES (${fullname}, ${email}, ${hashedPassword}, ${salt})
        `;

        // check if the insert was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                message: "Failed to register user",
                success: false
            });
        }

        // successful registration
		return res.status(201).json({
			message: "User registered successfully",
			success: true
		});
	} catch (error) {
        // handle errors
        console.error("Registration error:", error);
		return res.status(500).json({
			message: "Internal server error",
			success: false
		});
	}
});

// POST request to login a user
app.post('/api/auth/login', async (req, res) => {
    // get email and password from request body
    const { email, password } = req.body || {};

      // Check if username and password are provided
    if (!email || !password) {
        return res.status(400).send({ message: 'email and password are required', success: false });
    }

    // Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).send({ message: 'Invalid email format', success: false });
    }

    // Validate password length
    if (password.length < 8 || password.length > 20) {
        return res.status(400).send({ message: 'Password must be between 8 and 20 characters', success: false });
    }

    try {
        // Query the database for the user with the provided email
        const result = await sql.query`
            SELECT * FROM accounts WHERE email = ${email}
        `;
        // Check if user exists
        if (result.recordset.length === 0) {
            return res.status(401).send({ message: 'Invalid email or password', success: false });
        }

        // get user record
        const user = result.recordset[0];
        // Verify password
        const hashedInputPassword = hashPassword(password, user.salt);
        if (hashedInputPassword !== user.password) {
            return res.status(401).send({ message: 'Invalid email or password', success: false });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY, { 
            expiresIn: 86400 // 24 hours
        });

        // Successful login
        return res.status(201).send({ message: 'Login successful', success: true, token });
    } catch (error) {
        // Handle errors
        console.error('Login error:', error);
        return res.status(500).send({ message: 'Internal server error', success: false });
    }
});

// get menu items not requiring authentication
app.get('/api/menu/items', async (req, res) => {
    // fetch all menu items with their categories
    try {
        // query to get menu items with category names
        const result = await sql.query`
            SELECT 
                mi.id,
                mi.name,
                c.name AS category,
                mi.price,
                mi.description,
                mi.imageUrl,
                mi.available
            FROM MenuItems mi
            JOIN Categories c ON mi.categoryId = c.id
        `;

        // check if any no menu items found if yes return 404
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No menu items found'
            });
        }
        
        // return the menu items
        return res.status(200).json({
            success: true,
            items: result.recordset
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching menu items:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    
});

// create categories requiring authentication
app.post('/api/menu/create/category', verifyToken, async (req, res) => {
    // check if user is administrator
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const { name } = req.body || {};

    // category name validation
    if (!name || name.length < 3 || name.length > 50) {
        return res.status(400).json({
            success: false,
            message: 'Category name must be between 3 and 50 characters'
        });
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({
            success: false,
            message: 'Category name must contain only letters and spaces'
        });
    }

    try {
        // check for duplicate category
        if (await categoriesDuplicateCheck(sql, name)) {
            return res.status(409).json({
                success: false,
                message: 'Category already exists'
            });
        }

        // insert new category
        const result = await sql.query`
            INSERT INTO Categories (name) VALUES (${name})
        `;

        // check if insert was successful if rowsAffected is 0 then return error
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create category'
            });
        }

        // successful category creation
        return res.status(201).json({
            success: true,
            message: 'Category created successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error creating category:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// create menu items requiring authentication
app.post('/api/menu/create/item', verifyToken, async (req, res) => {
    // check if user is administrator
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    // get menu item data from request body
    const { name, categoryId, price, description, imageUrl, available } = req.body || {};

    // check for missing required fields
    if (!name || !categoryId || !price || available === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // validate menu item data
    const validationResult = isMenuItemValid(name, categoryId, price, description, available);
    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    try {
        // check if category exists
        if (!await checkCategoryExists(sql, categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Category does not exist'
            });
        }
        // insert new menu item
        const result = await sql.query`
            INSERT INTO MenuItems (name, categoryId, price, description, imageUrl, available)
            VALUES (${name}, ${categoryId}, ${price}, ${description || null}, ${imageUrl || null}, ${available})
        `;

        // check if insert was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create menu item'
            });
        }

        // successful menu item creation
        return res.status(201).json({
            success: true,
            message: 'Menu item created successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error creating menu item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// delete categories requiring authentication
app.delete('/api/menu/category/delete/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const categoryId = Number(req.params.id);

    // validate categoryId
    if (isNaN(categoryId) || categoryId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid category ID'
        });
    }

    try {
        // check if category exists
        if (!await checkCategoryExists(sql, categoryId)) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // check if category has associated menu items
        if (await hasMenuItems(sql, categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with associated menu items'
            });
        }
        // delete the category
        const result = await sql.query`
            DELETE FROM Categories WHERE id = ${categoryId}
        `;

        // check if delete was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete category'
            });
        }

        // successful category deletion
        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error deleting category:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    
});

// delete menu items requiring authentication
app.delete('/api/menu/item/delete/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const itemId = Number(req.params.id);

    // validate itemId
    if (isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid item ID'
        });
    }

    try {
        // delete the menu item
        const result = await sql.query`
            DELETE FROM MenuItems WHERE id = ${itemId}
        `;

        // check if delete was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // successful menu item deletion
        return res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error deleting menu item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// update menu items requiring authentication
app.put('/api/menu/update/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const itemId = Number(req.params.id);
    const { name, categoryId, price, description, imageUrl, available } = req.body || {};

    // validate itemId
    if (isNaN(itemId) || itemId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid item ID'
        });
    }

    // validate menu item data
    const validationResult = isMenuItemValid(name, categoryId, price, description, available);

    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    try {
        // check if category exists
        if (!await checkCategoryExists(sql, categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Category does not exist'
            });
        }

        // update the menu item
        const result = await sql.query`
            UPDATE MenuItems
            SET name = ${name},
                categoryId = ${categoryId},
                price = ${price},
                description = ${description || null},
                imageUrl = ${imageUrl || null},
                available = ${available}
            WHERE id = ${itemId}
        `;
        // check if update was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        // successful menu item update
        return res.status(200).json({
            success: true,
            message: 'Menu item updated successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error updating menu item:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


// Order endpoints

// place an order not requiring authentication
app.post('/api/orders/place', async (req, res) => {
    // check if user has sent bareerer token then get token data
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
            req.tokenData = decoded; 
        } catch (err) { 
            // invalid token, ignore and proceed as guest
        }
    }
    const { customerName, email, phone, items } = req.body || {};
    // validate required fields
    if (!customerName || !email || !phone || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing or invalid required fields'
        });
    }

    // validate order placement data
    const validationResult = isOrderPlacementValid(customerName, email, phone, items);

    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    // validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }
    try {
        // insert new order
        const result = await sql.query`
            INSERT INTO Orders (customerName, email, phone, items, status, accountId)
            VALUES (${customerName}, ${email}, ${phone}, ${JSON.stringify(items)}, 'pending', ${req.tokenData ? req.tokenData.id : 'NULL'})
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to place order'
            });
        }

        // successful order placement
        return res.status(201).json({
            success: true,
            message: 'Order placed successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error placing order:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// get own orders requiring authentication
app.get('/api/orders/myorders', verifyToken, async (req, res) => {
    try {
        const result = await sql.query`
            SELECT * FROM Orders WHERE accountId = ${req.tokenData.id}
        `;
        // check if any orders found
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No orders found'
            });
        }
        // return the orders
        return res.status(200).json({
            success: true,
            orders: result.recordset
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// user cancel own order by modifying order status requiring authentication
app.delete('/api/orders/cancel/:id', verifyToken, async (req, res) => {
    const orderId = Number(req.params.id);

    // validate orderId
    if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid order ID'
        });
    }

    try {
        // update the order status to 'cancelled'
        const result = await sql.query`
            UPDATE Orders SET status = 'cancelled' 
            WHERE id = ${orderId} AND accountId = ${req.tokenData.id}
        `;

        // check if update was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or you do not have permission to cancel this order'
            });
        }

        // successful order cancellation
        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error cancelling order:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// admin get all orders requiring authentication
app.get('/api/orders/all', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    try {
        const result = await sql.query`
            SELECT * FROM Orders
        `;
        // check if any orders found
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No orders found'
            });
        }
        // return the orders
        return res.status(200).json({
            success: true,
            orders: result.recordset
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// admin modify order status requiring authentication
app.put('/api/orders/update/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const orderId = Number(req.params.id);
    const { status } = req.body || {};

    // validate orderId
    if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid order ID'
        });
    }

    // validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value'
        });
    }

    try {
        // update the order status
        const result = await sql.query`
            UPDATE Orders SET status = ${status.toLowerCase()} WHERE id = ${orderId}
        `;

        // check if update was successful if not send 404
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // successful order status update
        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// return a 404 for any undefined routes
app.use((req, res, next) => {
  res.status(404).send({
    code: 404,
    message: 'Not Found'
  });
});

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));