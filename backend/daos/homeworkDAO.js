const Homework = require('../models/Homework');

class HomeworkDAO {
    constructor(model) {
        this.model = model;
    }

    async create(homeworkData) {
        try {
            const homework = new this.model(homeworkData);
            await homework.save();
            return homework;
        } catch (error) {
            throw new Error('Error creating homework: ' + error.message);
        }
    }

    async findById(homeworkId) {
        try {
            return await this.model.findById(homeworkId);
        } catch (error) {
            throw new Error('Error finding homework: ' + error.message);
        }
    }

    async findAll() {
        try {
            return await this.model.find();
        } catch (error) {
            throw new Error('Error finding all homework: ' + error.message);
        }
    }

    async update(homeworkId, homeworkData) {
        try {
            return await this.model.findByIdAndUpdate(homeworkId, homeworkData, { new: true });
        } catch (error) {
            throw new Error('Error updating homework: ' + error.message);
        }
    }

    async delete(homeworkId) {
        try {
            return await this.model.findByIdAndDelete(homeworkId);
        } catch (error) {
            throw new Error('Error deleting homework: ' + error.message);
        }
    }

    // Additional specific methods for Homework can be added here
    // For example, finding homework by course, etc.
}

module.exports = new HomeworkDAO(Homework);
