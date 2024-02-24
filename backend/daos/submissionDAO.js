const Submission = require('../models/Submission');

class SubmissionDAO {
    constructor(model) {
        this.model = model;
    }

    async create(submissionData) {
        try {
            const submission = new this.model(submissionData);
            await submission.save();
            return submission;
        } catch (error) {
            throw new Error('Error creating submission: ' + error.message);
        }
    }

    async findById(submissionId) {
        try {
            return await this.model.findById(submissionId);
        } catch (error) {
            throw new Error('Error finding submission: ' + error.message);
        }
    }

    async findAll() {
        try {
            return await this.model.find().populate('homework').populate('student');
        } catch (error) {
            throw new Error('Error finding all submissions: ' + error.message);
        }
    }

    async update(submissionId, submissionData) {
        try {
            return await this.model.findByIdAndUpdate(submissionId, submissionData, { new: true });
        } catch (error) {
            throw new Error('Error updating submission: ' + error.message);
        }
    }

    async delete(submissionId) {
        try {
            return await this.model.findByIdAndDelete(submissionId);
        } catch (error) {
            throw new Error('Error deleting submission: ' + error.message);
        }
    }

    // Additional methods specific to Submission operations can be added here
    // For example, finding submissions by homework ID, student ID, etc.
}

module.exports = new SubmissionDAO(Submission);
