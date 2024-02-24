const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  dueDate: Date,
}, { timestamps: true });

const Homework = mongoose.model('Homework', homeworkSchema);

module.exports = Homework;
