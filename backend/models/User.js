const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student', // Set default role to 'student'
    required: true,
  },
  tokens: [{
    token: {
        type: String,
        required: true
    },
    lastAction: {
        type: Date,
        required: true
    }
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
