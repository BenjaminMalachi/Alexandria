const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole, updateLastAction } = require('../middleware/verifyToken');
const { upload, SubmissionController } = require('../controllers/submissionController');

router.post('/', upload.single('file'), verifyToken, verifyRole(['student']), updateLastAction, SubmissionController.createSubmission);

router.get('/', verifyToken, verifyRole(['teacher', 'admin']), updateLastAction, SubmissionController.findAllSubmissions);

router.get('/student/:id', verifyToken, updateLastAction, SubmissionController.findSubmissionsByStudent);

router.patch('/:id', upload.single('file'), verifyToken, verifyRole(['teacher', 'student']), updateLastAction, SubmissionController.updateSubmission);

router.delete('/:id', verifyToken, verifyRole(['student']), updateLastAction, SubmissionController.deleteSubmission);

router.get('/teacher/submissions', verifyToken, verifyRole(['teacher']),updateLastAction, SubmissionController.findSubmissionsForTeacher);

router.get('/student/submissions', verifyToken, updateLastAction, SubmissionController.findSubmissionsForLoggedInStudent);

router.get('/file/:s3Key', verifyToken, updateLastAction, SubmissionController.getFile);

module.exports = router;