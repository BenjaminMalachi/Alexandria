const express = require('express');
const Submission = require('../models/Submission');
const router = express.Router();
const createError = require('http-errors');
const { verifyToken, verifyRole, updateLastAction } = require('../middleware/verifyToken');

// POST a new submission (Students)
router.post('/', verifyToken, verifyRole(['student']), updateLastAction, async (req, res) => {
    const { homework, student, answer } = req.body;
    try {
        const newSubmission = new Submission({
            homework,
            student,
            answer
        });
        await newSubmission.save();
        res.status(201).json(newSubmission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET all submissions (Teachers and Admins)
router.get('/', verifyToken, verifyRole(['teacher', 'admin']), updateLastAction, async (req, res) => {
    try {
        const submissions = await Submission.find();
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a student's submissions (Students, Teachers, and Admins)
router.get('/student/:studentId', verifyToken, updateLastAction, async (req, res) => {
    try {
        const { studentId } = req.params;
        const submissions = await Submission.find({ student: studentId });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH update a submission (Students)
router.patch('/:id', verifyToken, verifyRole(['student']), updateLastAction, async (req, res) => {
    try {
        const submission = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE a submission (Students)
router.delete('/:id', verifyToken, verifyRole(['student']), updateLastAction, async (req, res) => {
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.send('Submission deleted');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/teacher/submissions', verifyToken, verifyRole(['teacher']), async (req, res) => {
    try {
        const teacherId = req.user.id; // Adjust based on how user ID is stored in your request
        // Fetch courses taught by this teacher. Assume Course model exists and has a reference to the teacher.
        const courses = await Course.find({ teacher: teacherId }).select('id'); // Only fetch course IDs

        // Convert course documents into an array of IDs
        const courseIds = courses.map(course => course.id);

        // Fetch submissions for these courses
        const submissions = await Submission.find({
            course: { $in: courseIds },
            // Add any other filters as necessary, e.g., based on date, status, etc.
        });

        // Optionally categorize submissions into outstanding and toGrade
        const categorizedSubmissions = submissions.reduce((acc, submission) => {
            if (submission.graded) {
                acc.toGrade.push(submission);
            } else {
                acc.outstanding.push(submission);
            }
            return acc;
        }, { outstanding: [], toGrade: [] });

        res.json(categorizedSubmissions);
    } catch (error) {
        console.error('Failed to fetch submissions for teacher:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/student/submissions', verifyToken, updateLastAction, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Access denied. Available only for students." });
    }

    try {
        const studentId = req.user.id; // Logged-in user's ID, assuming it's set by verifyToken
        const submissions = await Submission.find({ student: studentId });
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;