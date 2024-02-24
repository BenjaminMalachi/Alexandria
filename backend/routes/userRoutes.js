const express = require('express');
const User = require('../models/User');
const router = express.Router();
const createError = require('http-errors');
const { verifyToken, verifyRole, updateLastAction } = require('../middleware/verifyToken');

const getUserData = async (userId) => {
    // Your logic to fetch user data from the database
    return { name: "John Doe", id: userId };
};

// Get all users (Admin only)
router.get('/', verifyToken, verifyRole(['admin']), updateLastAction, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single user by ID (Admin only)
router.get('/:id', verifyToken, verifyRole(['admin']), updateLastAction, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a user (Admin only)
router.patch('/:id', verifyToken, verifyRole(['admin']), updateLastAction, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a user (Admin only)
router.delete('/:id', verifyToken, verifyRole(['admin']), updateLastAction, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.send('User deleted');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/me', verifyToken, async (req, res) => {
    try {
        // Assuming req.user is set by your authentication middleware
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Optionally, pick what data to send back for privacy/security
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            // Add any other fields you want to include
        };
        res.json(userData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/userdata', async (req, res, next) => {
    try {
        // Example: Fetch user data. You might want to get the user ID from the request.
        const userId = req.user.id; // This is just an example. Adjust according to your auth strategy.
        const userData = await getUserData(userId);
        res.json(userData);
    } catch (error) {
        next(createError(500, "Internal Server Error"));
    }
});

module.exports = router;