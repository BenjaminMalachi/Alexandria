const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/verifyToken');
const User = require('../models/User');
const Course = require('../models/course');

// Assuming verifyToken and verifyRole are middleware that check the user's token and role
router.get('/statistics', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const studentCount = await User.countDocuments({ role: 'student' });
        const courseCount = await Course.countDocuments();
        
        res.json({
            userCount,
            adminCount,
            studentCount,
            courseCount,
        });
    } catch (error) {
        console.error('Failed to fetch admin statistics:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;