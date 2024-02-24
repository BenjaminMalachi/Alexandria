const User = require('../models/User');

class UserDAO {
    constructor(model) {
        this.model = model;
    }

    async create(userData) {
        try {
            const user = new this.model(userData);
            await user.save();
            return user;
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    async findById(userId) {
        try {
            return await this.model.findById(userId);
        } catch (error) {
            throw new Error('Error finding user: ' + error.message);
        }
    }

    async findAll() {
        try {
            return await this.model.find();
        } catch (error) {
            throw new Error('Error finding users: ' + error.message);
        }
    }

    async update(userId, userData) {
        try {
            return await this.model.findByIdAndUpdate(userId, userData, { new: true });
        } catch (error) {
            throw new Error('Error updating user: ' + error.message);
        }
    }

    async delete(userId) {
        try {
            return await this.model.findByIdAndDelete(userId);
        } catch (error) {
            throw new Error('Error deleting user: ' + error.message);
        }
    }
}

module.exports = new UserDAO(User);
