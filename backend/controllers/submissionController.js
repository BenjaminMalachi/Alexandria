const SubmissionDAO = require('../daos/submissionDAO');

class SubmissionController {
    static async createSubmission(req, res) {
        try {
            const submissionData = req.body;
            const newSubmission = await SubmissionDAO.create(submissionData);
            res.status(201).json(newSubmission);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findSubmissionById(req, res) {
        try {
            const submissionId = req.params.id;
            const submission = await SubmissionDAO.findById(submissionId);
            if (!submission) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            res.json(submission);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findAllSubmissions(req, res) {
        try {
            const submissions = await SubmissionDAO.findAll();
            res.json(submissions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateSubmission(req, res) {
        try {
            const submissionId = req.params.id;
            const updateData = req.body;
            const updatedSubmission = await SubmissionDAO.update(submissionId, updateData);
            if (!updatedSubmission) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            res.json(updatedSubmission);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteSubmission(req, res) {
        try {
            const submissionId = req.params.id;
            const deletedSubmission = await SubmissionDAO.delete(submissionId);
            if (!deletedSubmission) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            res.status(204).send(); // No Content
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SubmissionController;
