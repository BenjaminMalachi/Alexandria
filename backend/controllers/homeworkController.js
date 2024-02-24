const HomeworkDAO = require('../daos/homeworkDAO');

class HomeworkController {
    static async createHomework(req, res) {
        try {
            const homeworkData = req.body;
            const newHomework = await HomeworkDAO.create(homeworkData);
            res.status(201).json(newHomework);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findHomeworkById(req, res) {
        try {
            const homeworkId = req.params.id;
            const homework = await HomeworkDAO.findById(homeworkId);
            if (!homework) {
                return res.status(404).json({ error: 'Homework not found' });
            }
            res.json(homework);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findAllHomework(req, res) {
        try {
            const homeworkAssignments = await HomeworkDAO.findAll();
            res.json(homeworkAssignments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateHomework(req, res) {
        try {
            const homeworkId = req.params.id;
            const updateData = req.body;
            const updatedHomework = await HomeworkDAO.update(homeworkId, updateData);
            if (!updatedHomework) {
                return res.status(404).json({ error: 'Homework not found' });
            }
            res.json(updatedHomework);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteHomework(req, res) {
        try {
            const homeworkId = req.params.id;
            const deletedHomework = await HomeworkDAO.delete(homeworkId);
            if (!deletedHomework) {
                return res.status(404).json({ error: 'Homework not found' });
            }
            res.status(204).send(); // No Content
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = HomeworkController;
