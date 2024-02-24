const CourseDAO = require('../daos/courseDAO');

class CourseController {
    static async createCourse(req, res) {
        try {
            const courseData = req.body;
            const newCourse = await CourseDAO.create(courseData);
            res.status(201).json(newCourse);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findCourseById(req, res) {
        try {
            const courseId = req.params.id;
            const course = await CourseDAO.findById(courseId);
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            res.json(course);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findAllCourses(req, res) {
        try {
            const courses = await CourseDAO.findAll();
            res.json(courses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateCourse(req, res) {
        try {
            const courseId = req.params.id;
            const updateData = req.body;
            const updatedCourse = await CourseDAO.update(courseId, updateData);
            if (!updatedCourse) {
                return res.status(404).json({ error: 'Course not found' });
            }
            res.json(updatedCourse);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteCourse(req, res) {
        try {
            const courseId = req.params.id;
            const deletedCourse = await CourseDAO.delete(courseId);
            if (!deletedCourse) {
                return res.status(404).json({ error: 'Course not found' });
            }
            res.status(204).send(); // No Content
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CourseController;
