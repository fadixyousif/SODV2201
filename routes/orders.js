import express from 'express';
import sql from '../db.js';
import { verifyToken } from '../modules/authentication.js';
import { isOrderPlacementValid, isValidEmail } from '../modules/validation.js';
import { isAdministrator } from '../modules/queries.js';

const router = express.Router();


// place an order not requiring authentication
router.post('/place', async (req, res) => {
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
        const insertReq = new sql.Request();
        insertReq.input('accountId', sql.Int, req.tokenData ? req.tokenData.id : null);
        insertReq.input('customerName', sql.NVarChar(100), customerName);
        insertReq.input('email', sql.NVarChar(255), email);
        insertReq.input('phone', sql.NVarChar(30), phone);
        insertReq.input('items', sql.NVarChar(sql.MAX), JSON.stringify(items));
        insertReq.input('status', sql.NVarChar(50), 'pending');
        const result = await insertReq.query(
            'INSERT INTO Orders (accountId, customerName, email, phone, items, status) VALUES (@accountId, @customerName, @email, @phone, @items, @status)'
        );

        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({ success: false, message: 'Failed to place order' });
        }

        // successful order placement
        return res.status(201).json({ success: true, message: 'Order placed successfully' });
    } catch (error) {
        // handle errors
        console.error('Error placing order:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// get all orders not requiring authentication using order id and only guest user is allowed
router.get('/id/:id', async (req, res) => {
    const orderId = Number(req.params.id);
    // validate orderId
    if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid order ID'
        });
    }

    try {
        // fetch the order for guest user (accountId IS NULL)
        const reqQ = new sql.Request();
        reqQ.input('id', sql.Int, orderId);
        const result = await reqQ.query('SELECT * FROM Orders WHERE id = @id AND accountId IS NULL');

        // check if order found if not send 404
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // return the order
        return res.status(200).json({
            success: true,
            order: result.recordset[0]
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching order:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// get own orders requiring authentication
router.get('/myorders', verifyToken, async (req, res) => {
    try {
        const reqQ = new sql.Request();
        reqQ.input('accountId', sql.Int, req.tokenData.id);
        const result = await reqQ.query('SELECT * FROM Orders WHERE accountId = @accountId');
        // check if any orders found
        if (result.recordset.length === 0) {
            return res.status(500).json({
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
router.delete('/cancel/:id', verifyToken, async (req, res) => {
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
        const updReq = new sql.Request();
        updReq.input('id', sql.Int, orderId);
        updReq.input('accountId', sql.Int, req.tokenData.id);
        const result = await updReq.query('UPDATE Orders SET status = @status WHERE id = @id AND accountId = @accountId', { status: 'cancelled' });

        // check if update was successful
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
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
router.get('/all', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    try {
        const reqQ = new sql.Request();
        const result = await reqQ.query('SELECT * FROM Orders');
        // check if any orders found
        if (result.recordset.length === 0) {
            return res.status(500).json({
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
router.put('/update/:id', verifyToken, async (req, res) => {
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
        const updReq = new sql.Request();
        updReq.input('status', sql.NVarChar(50), status.toLowerCase());
        updReq.input('id', sql.Int, orderId);
        const result = await updReq.query('UPDATE Orders SET status = @status WHERE id = @id');

        // check if update was successful if not send 404
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
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

export default router;
