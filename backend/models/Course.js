const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  teacher: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
