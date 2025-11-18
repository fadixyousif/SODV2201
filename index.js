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
    isValidEmail
} from './modules/validation.js';

import {
    registerCheckUserExists
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