import express from 'express';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import { verifyToken } from '../modules/authentication.js';
import { isReservationValid } from '../modules/validation.js';
import { isAdministrator } from '../modules/queries.js';

const router = express.Router();

// create a reservation not requiring authentication but if user is logged in link reservation to account
router.post('/create', async (req, res) => {
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
    
    const { customerName, email, phone, reservationDate, time, numberOfGuests } = req.body || {};

    // validate required fields
    if (!customerName || !email || !phone || !reservationDate || !time || !numberOfGuests) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    // validate reservation data
    const validationResult = isReservationValid(customerName, email, phone, reservationDate, numberOfGuests);
    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    try {
        // parse reservation date/time
        const dt = new Date(reservationDate);
        if (isNaN(dt.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid reservationDate' });
        }
        const dateOnly = dt.toISOString().slice(0, 10); // YYYY-MM-DD

        // Prevent double booking: check for overlapping reservations
        const checkReq = new sql.Request();
        checkReq.input('date', sql.Date, dateOnly);
        checkReq.input('time', sql.Time, new Date(`1970-01-01T${time}Z`));
        const overlapCheck = await checkReq.query(
            "SELECT * FROM Reservations WHERE date = @date AND time = @time AND status_response != 'cancelled'"
        );

        // if overlapping reservation exists, return conflict error
        if (overlapCheck.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A reservation already exists for this date and time.'
            });
        }

        // insert new reservation
        const insertReq = new sql.Request();
        insertReq.input('accountId', sql.Int, req.tokenData ? req.tokenData.id : null);
        insertReq.input('customerName', sql.NVarChar(100), customerName);
        insertReq.input('email', sql.NVarChar(100), email);
        insertReq.input('phone', sql.NVarChar(30), phone);
        insertReq.input('date', sql.Date, dateOnly);
        insertReq.input('time', sql.Time, new Date(`1970-01-01T${time}Z`));
        insertReq.input('guests', sql.Int, Number(numberOfGuests));
        insertReq.input('specialRequest', sql.NVarChar(200), req.body.specialRequest || null);
        const result = await insertReq.query(
            'INSERT INTO Reservations (accountId, customerName, email, phone, date, time, guests, specialRequest) VALUES (@accountId, @customerName, @email, @phone, @date, @time, @guests, @specialRequest)'
        );

        // check if insert was successful if not send 500 error
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({ success: false, message: 'Failed to create reservation' });
        }

        // successful reservation creation
        return res.status(201).json({ success: true, message: 'Reservation created successfully' });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// get reservation by id not requiring authentication and only return if reservation belongs to a guest reservation
router.get('/id/:id', async (req, res) => {
    const reservationId = Number(req.params.id);
    // validate reservationId
    if (isNaN(reservationId) || reservationId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid reservation ID'
        });
    }

    try {
        // fetch the reservation
        const reqQ = new sql.Request();
        reqQ.input('id', sql.Int, reservationId);
        const result = await reqQ.query('SELECT * FROM Reservations WHERE id = @id AND accountId IS NULL AND status_response != \'cancelled\'');
        // check if reservation found
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        // return the reservation
        return res.status(200).json({
            success: true,
            reservation: result.recordset[0]
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching reservation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// get own reservations requiring authentication
router.get('/myreservations', verifyToken, async (req, res) => {
    try {
        // fetch reservations for the logged-in user
        const reqQ = new sql.Request();
        reqQ.input('accountId', sql.Int, req.tokenData.id);
        const result = await reqQ.query('SELECT * FROM Reservations WHERE accountId = @accountId');

        // check if any reservations found
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'No reservations found' });
        }
        // return the reservations
        return res.status(200).json({ success: true, reservations: result.recordset });
    } catch (error) {
        // handle errors
        console.error('Error fetching reservations:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
        
// cancel own reservation not requiring authentication only
router.delete('/cancel/:id', async (req, res) => {
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

    const reservationId = Number(req.params.id);

    // validate reservationId
    if (isNaN(reservationId) || reservationId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid reservation ID'
        });
    }

    // cancel the reservation by deleting it; allow guest cancellation when accountId is NULL
    try {
        const delReq = new sql.Request();
        delReq.input('id', sql.Int, reservationId);
        delReq.input('accountId', sql.Int, req.tokenData ? req.tokenData.id : null);
        const result = await delReq.query(
            'UPDATE Reservations SET status_response = \'cancelled\', status_reason = \'Cancelled by user\' WHERE id = @id AND (accountId = @accountId OR accountId IS NULL)'
        );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found or you do not have permission to cancel this reservation'
            });
        }

        return res.status(200).json({ success: true, message: 'Reservation cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// admin get all reservations requiring authentication
router.get('/all', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    try {
        const reqQ = new sql.Request();
        const result = await reqQ.query('SELECT * FROM Reservations');

        // check if any reservations found if not send 404
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'No reservations found' });
        }

        // return the reservations
        return res.status(200).json({ success: true, reservations: result.recordset });
    } catch (error) {
        // handle errors
        console.error('Error fetching all reservations:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// change reservation status, date, and time requiring authentication
router.put('/update/:id', verifyToken, async (req, res) => {
    if (!await isAdministrator(sql, req.tokenData.email)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Administrator access required'
        });
    }

    const reservationId = Number(req.params.id);
    const { reservationDate, numberOfGuests, status } = req.body || {};

    // validate reservationId
    if (isNaN(reservationId) || reservationId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid reservation ID'
        });
    }

    // validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value'
        });
    }

    // validate and prepare updates
    let dateOnly = null;
    let timeOnly = null;
    if (reservationDate) {
        const dt = new Date(reservationDate);
        if (isNaN(dt.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid reservationDate' });
        }
        dateOnly = dt.toISOString().slice(0, 10);
        timeOnly = dt.toTimeString().slice(0, 8);
    }

    try {
        const updReq = new sql.Request();
        updReq.input('id', sql.Int, reservationId);
        if (dateOnly) {
            updReq.input('date', sql.Date, dateOnly);
            updReq.input('time', sql.Time, timeOnly);
        }
        if (numberOfGuests !== undefined) updReq.input('guests', sql.Int, Number(numberOfGuests));
        if (status) updReq.input('status_response', sql.NVarChar(20), status.toLowerCase());

        const sets = [];
        if (dateOnly) sets.push('date = @date', 'time = @time');
        if (numberOfGuests !== undefined) sets.push('guests = @guests');
        if (status) sets.push('status_response = @status_response');

        if (sets.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

        const sqlText = `UPDATE Reservations SET ${sets.join(', ')} WHERE id = @id`;
        const result = await updReq.query(sqlText);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        return res.status(200).json({ success: true, message: 'Reservation updated successfully' });
    } catch (error) {
        console.error('Error updating reservation:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


export default router;
