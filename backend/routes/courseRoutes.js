const express = require('express');
const Course = require('../models/Course');
const router = express.Router();
const createError = require('http-errors');
const User = require('../models/User');
const { verifyToken, verifyRole, updateLastAction } = require('../middleware/verifyToken');


// Create a new course (Admins and Teachers)
router.post('/', verifyToken, verifyRole(['admin', 'teacher']), updateLastAction, async (req, res) => {
    const { title, description, teacher, students } = req.body;
    try {
        const newCourse = new Course({
            title,
            description,
            teacher,
            students
        });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all courses
router.get('/', verifyToken, updateLastAction, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single course by ID
router.get('/:id', verifyToken, updateLastAction, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found');
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a course (Admins and Teachers)
router.patch('/:id', verifyToken, verifyRole(['admin', 'teacher']), updateLastAction, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).send('Course not found');
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a course (Admins and Teachers)
router.delete('/:id', verifyToken, verifyRole(['admin', 'teacher']), updateLastAction, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).send('Course not found');
        res.send('Course deleted');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/teacher/courses', verifyToken, verifyRole(['teacher', 'admin']), async (req, res) => {
    try {
        const teacherId = req.user.id; // Assuming this is set by your authentication middleware
        const courses = await Course.find({ teacher: teacherId });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/student/courses', verifyToken, updateLastAction, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Access denied. Available only for students." });
    }

    try {
        const studentId = req.user.id; // Logged-in user's ID
        const courses = await Course.find({ students: studentId }).populate('students', 'username email'); // Optionally populate student details
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;