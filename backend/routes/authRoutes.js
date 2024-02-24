const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyRole, updateLastAction } = require('../middleware/verifyToken');


// Register User
router.post('/register', async (req, res) => {
    try {
        console.log(req.body); // Log the request body to see the data
        const { username, email, password, role } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(  10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        await user.save();

        res.status(201).send('User created successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Email or password is wrong');

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send('Invalid password');

        // Generate JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.header('Authorization', token).send(token);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/protected', verifyToken, (req, res) => {
    res.send('Protected content');
});

module.exports = router;
