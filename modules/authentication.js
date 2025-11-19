import jwt from "jsonwebtoken";
import crypto from "crypto";

export const verifyToken = (req, res, next) => { 
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Unauthorized", success: false });
    }

    const token = authHeader.split(" ")[1]; // Extract the token part

    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 

        req.tokenData = decoded; 
        next(); // Proceed to the next middleware
    } catch (err) { 
        return res.status(401).json({ error: "Invalid token", success: false }); 
    } 
};

export const hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 10, 64, 'sha512').toString('hex');
}
