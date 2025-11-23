import express from 'express';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import { verifyToken } from '../modules/authentication.js';
import { isReservationValid } from '../modules/validation.js';
import { isAdministrator } from '../modules/queries.js';

const router = express.Router();

// create a reservation not requiring authentication but if user is logged in link reservation to account
router.post('/create', verifyToken, async (req, res) => {
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

    const { customerName, email, phone, reservationDate, numberOfGuests } = req.body || {};

    // validate required fields
    if (!customerName || !email || !phone || !reservationDate || !numberOfGuests) {
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
        // Prevent double booking: check for overlapping reservations
        const overlapCheck = await sql.query`
            SELECT * FROM Reservations
            WHERE date = ${date}
            AND time = ${time}
            AND status_response != 'cancelled'
        `;

        // if overlapping reservation exists, return conflict error
        if (overlapCheck.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A reservation already exists for this date and time.'
            });
        }

        // insert new reservation
        const result = await sql.query`
            INSERT INTO Reservations (customerName, email, phone, reservationDate, numberOfGuests, accountId)
            VALUES (${customerName}, ${email}, ${phone}, ${new Date(reservationDate)}, ${numberOfGuests}, ${req.tokenData ? req.tokenData.id : 'NULL'})
        `;

        // check if insert was successful if not send 500 error
        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create reservation'
            });
        }

        // successful reservation creation
        return res.status(201).json({
            success: true,
            message: 'Reservation created successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error creating reservation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// get reservation by id not requiring authentication and only return if reservation belongs to a guest reservation
router.get('/:id', async (req, res) => {
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
        const result = await sql.query`
            SELECT * FROM Reservations WHERE id = ${reservationId} AND accountId IS NULL
        `;
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
        const result = await sql.query`
            SELECT * FROM Reservations WHERE accountId = ${req.tokenData.id}
        `;

        // check if any reservations found
        if (result.recordset.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'No reservations found'
            });
        }
        // return the reservations
        return res.status(200).json({
            success: true,
            reservations: result.recordset
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching reservations:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
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

    // cancel the reservation by editing its status and if the accountid is null allow cancellation if user is guest
    try {
        const result = await sql.query`
            DELETE FROM Reservations 
            WHERE id = ${reservationId} 
            AND (accountId = ${req.tokenData ? req.tokenData.id : 'NULL'} OR accountId IS NULL)
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({
                success: false,
                message: 'Reservation not found or you do not have permission to cancel this reservation'
            });
        }

        // successful reservation cancellation
        return res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully'
        });
    } catch (error) {
        // handle errors
        console.error('Error cancelling reservation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
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
        const result = await sql.query`
            SELECT * FROM Reservations
        `;

        // check if any reservations found if not send 404
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No reservations found'
            });
        }

        // return the reservations
        return res.status(200).json({
            success: true,
            reservations: result.recordset
        });
    } catch (error) {
        // handle errors
        console.error('Error fetching all reservations:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
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

    const validationResult = isReservationValid(customerName, email, phone, reservationDate, numberOfGuests);

    if (!validationResult.success) {
        return res.status(400).json(validationResult);
    }

    try {
        // update the reservation
        const result = await sql.query`
            UPDATE Reservations
            SET reservationDate = ${new Date(reservationDate)},
                numberOfGuests = ${numberOfGuests}
            WHERE id = ${reservationId}
        `;
        // check if update was successful if not send 404
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // successful reservation update
        return res.status(200).json({
            success: true,
            message: 'Reservation updated successfully'
        });
    }
    catch (error) {
        // handle errors
        console.error('Error updating reservation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


export default router;
