const jwt = require('jsonwebtoken');
const User = require('../models/User');

function verifyToken(req, res, next) {
    // Temporarily log the JWT_SECRET for debugging
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const bearerHeader = req.header('Authorization');
    if (!bearerHeader) return res.status(401).send('Access Denied');

    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1]; // This extracts the token part
    if (!bearerToken) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(bearerToken, process.env.JWT_SECRET);
        req.user = verified; // Attach the user payload to the request
        next(); // Proceed to the next middleware/function
    } catch (error) {
        // Log the specific error message and return it in the response for debugging
        console.error("Token verification error:", error.message); 
        return res.status(400).send('Invalid Token: ' + error.message);
    }
}

function verifyRole(role) {
    return function(req, res, next) {

        const bearerHeader = req.header('Authorization');
        if (!bearerHeader) return res.status(401).send('Access Denied');

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1]; // This extracts the token part
        if (!bearerToken) return res.status(401).send('Access Denied');

        try {
            const verified = jwt.verify(bearerToken, process.env.JWT_SECRET);
            console.log(verified, req.user);
            req.user = verified;
            if (!role.includes(req.user.role)) {
                return res.status(403).send('You do not have permission to perform this action');
            }
            next();
        } catch (error) {
            res.status(400).send('Invalid User: ' + error.message);
        }
    };
}

async function updateLastAction(req, res, next) {
    const token = req.header('Authorization').split(' ')[1]; // Assuming Bearer token is used
    try {
        await User.findOneAndUpdate(
            {"tokens.token": token},
            {"$set": {"tokens.$.lastAction": new Date()}}
        );
        next();
    } catch (err) {
        console.error("Error updating last action:", err);
        return res.status(500).send("An error occurred while updating user's last action.");
    }
}

module.exports = { verifyToken, verifyRole, updateLastAction };
