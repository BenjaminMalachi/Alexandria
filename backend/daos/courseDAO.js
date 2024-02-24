const Course = require('../models/course');

class CourseDAO {
    constructor(model) {
        this.model = model;
    }

    async create(courseData) {
        try {
            const course = new this.model(courseData);
            await course.save();
            return course;
        } catch (error) {
            throw new Error('Error creating course: ' + error.message);
        }
    }

    async findById(courseId) {
        try {
            return await this.model.findById(courseId);
        } catch (error) {
            throw new Error('Error finding course: ' + error.message);
        }
    }

    async findAll() {
        try {
            return await this.model.find();
        } catch (error) {
            throw new Error('Error finding courses: ' + error.message);
        }
    }

    async update(courseId, courseData) {
        try {
            return await this.model.findByIdAndUpdate(courseId, courseData, { new: true });
        } catch (error) {
            throw new Error('Error updating course: ' + error.message);
        }
    }

    async delete(courseId) {
        try {
            return await this.model.findByIdAndDelete(courseId);
        } catch (error) {
            throw new Error('Error deleting course: ' + error.message);
        }
    }

    // Here, you can add more specific methods related to the Course operations
}

module.exports = new CourseDAO(Course);
