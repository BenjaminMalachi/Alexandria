const express = require('express');
const Homework = require('../models/Homework');
const router = express.Router();
const { verifyToken, verifyRole, updateLastAction } = require('../middleware/verifyToken');

// Create new homework (Teachers only)
router.post('/', verifyToken, verifyRole(['teacher', 'admin']), updateLastAction, async (req, res) => {
    const { course, title, description, dueDate } = req.body;
    try {
        const newHomework = new Homework({
            course,
            title,
            description,
            dueDate
        });
        await newHomework.save();
        res.status(201).json(newHomework);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all homework
router.get('/', verifyToken, updateLastAction, async (req, res) => {
    try {
        const homeworks = await Homework.find().populate('course');
        res.json(homeworks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single homework by ID
router.get('/:id', verifyToken, updateLastAction, async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id).populate('course');
        if (!homework) return res.status(404).send('Homework not found');
        res.json(homework);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update homework (Teachers only)
router.patch('/:id', verifyToken, verifyRole(['teacher', 'admin']), updateLastAction, async (req, res) => {
    try {
        const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!homework) return res.status(404).send('Homework not found');
        res.json(homework);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete homework (Teachers only)
router.delete('/:id', verifyToken, verifyRole(['teacher', 'admin']), updateLastAction, async (req, res) => {
    try {
        const homework = await Homework.findByIdAndDelete(req.params.id);
        if (!homework) return res.status(404).send('Homework not found');
        res.send('Homework deleted');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;