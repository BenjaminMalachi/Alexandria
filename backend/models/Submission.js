const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  homework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework', // Assuming this should reference a 'Homework' model instead of 'User'
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answer: String,
  grade: String,
  fileUpload: { // Added to track file uploads
    s3Bucket: String, // Name of the S3 bucket where the file is stored
    s3Key: String, // The key (path) in the S3 bucket where the file is stored
  },
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
