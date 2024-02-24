const UserDAO = require('../daos/userDAO');

class UserController {
    static async createUser(req, res) {
        try {
            const userData = req.body;
            const newUser = await UserDAO.create(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserDAO.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findAllUsers(req, res) {
        try {
            const users = await UserDAO.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const updateData = req.body;
            const updatedUser = await UserDAO.update(userId, updateData);
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const deletedUser = await UserDAO.delete(userId);
            if (!deletedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(204).send(); // No Content
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;
