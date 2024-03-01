const SubmissionDAO = require('../daos/submissionDAO');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Submission = require('../models/Submission');

const app = express()

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromEnv(), // This automatically loads credentials from environment variables
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const newFileName = `${Date.now()}_${file.originalname}`;
            cb(null, newFileName)
        }
    })
});

const deleteFileFromS3 = async (s3Key, s3Bucket) => {
    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
    };
  
    try {
      // Use DeleteObjectCommand to create a command object for deletion
      const command = new DeleteObjectCommand(params);
      // Use send method of the client with the command object
      await s3.send(command);
      console.log("File deleted successfully from S3");
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw new Error("Failed to delete file from S3.");
    }
  };

class SubmissionController {

    static async createSubmission(req, res) {
        try {
            if (req.file) {
                // You now have the file information in req.file, thanks to multer-s3
                const fileUploadInfo = {
                    s3Bucket: process.env.AWS_BUCKET_NAME,
                    s3Key: req.file.key,
                };

                // Include this fileUploadInfo in the data you're passing to your DAO for creating a new submission
                const submissionData = {
                    ...req.body, // This contains homework, student, answer, grade, etc.
                    fileUpload: fileUploadInfo,
                };

                const newSubmission = await SubmissionDAO.create(submissionData);
                res.status(201).json(newSubmission);
            } else {
                // Handle case where no file is uploaded if necessary
                res.status(400).json({ error: 'No file uploaded' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findSubmissionById(req, res) {
        try {
            const submissionId = req.params.id;
            const submission = await SubmissionDAO.findById(submissionId);
            if (!submission) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            res.json(submission);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findAllSubmissions(req, res) {
        try {
            const submissions = await Submission.find();
            res.json(submissions);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async updateSubmission(req, res) {
        try {
          const submissionId = req.params.id;
          const submissionDetails = req.body; // Contains updated submission details except file
          const file = req.file; // New file to upload, if present
    
          const submissionToUpdate = await Submission.findById(submissionId);
    
          if (!submissionToUpdate) {
            return res.status(404).send({ message: "Submission not found." });
          }
    
          // If there's a new file to upload
          if (file) {
            // Delete the old file from S3, if it exists
            if (submissionToUpdate.fileUpload && submissionToUpdate.fileUpload.s3Key) {
              await deleteFileFromS3(submissionToUpdate.fileUpload.s3Key, process.env.AWS_BUCKET_NAME);
            }
    
            // Prepare and send the new file to S3
            const newS3Key = `${Date.now()}_${file.originalname}`;
            const uploadParams = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: newS3Key,
              Body: file.buffer, // Multer stores the file buffer here
              ContentType: file.mimetype,
            };
    
            await s3.send(new PutObjectCommand(uploadParams));
    
            // Update the submission with the new file's S3 key
            submissionDetails.fileUpload = {
              s3Bucket: process.env.AWS_BUCKET_NAME,
              s3Key: newS3Key,
            };
          }
    
          // Update the submission document in MongoDB
          const updatedSubmission = await Submission.findByIdAndUpdate(submissionId, submissionDetails, { new: true });
    
          res.send({ message: "Submission updated successfully.", updatedSubmission });
        } catch (error) {
          console.error("Error in updateSubmission:", error);
          res.status(500).send({ message: error.message });
        }
    }

    static async deleteSubmission(req, res) {
        try {
            const submissionId = req.params.id;
            const submissionToDelete = await SubmissionDAO.findById(submissionId);
            
            if (submissionToDelete && submissionToDelete.fileUpload && submissionToDelete.fileUpload.s3Key) {
                // Delete the file from S3
                await s3.deleteObject({
                    Bucket: submissionToDelete.fileUpload.s3Bucket,
                    Key: submissionToDelete.fileUpload.s3Key,
                }).promise();
            }
    
            // Now delete the submission from MongoDB
            const deletedSubmission = await SubmissionDAO.delete(submissionId);
            if (!deletedSubmission) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            res.status(204).send(); // No Content
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getFile(req, res) {
        const { s3Key } = req.params;
      
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
          });
          const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // Adjust expiresIn as needed
      
          res.json({ url });
        } catch (error) {
          console.error('Error generating file download link:', error);
          res.status(500).json({ error: error.message });
        }
    }

    static async findSubmissionsByStudent(req, res) {
        try {
            const { id  } = req.params;
            const submissions = await Submission.find({ student: id  });
            res.json(submissions);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async findSubmissionsForTeacher(req, res) {
        try {
            const teacherId = req.user.id;
            const courses = await Course.find({ teacher: teacherId }).select('id');
            const courseIds = courses.map(course => course.id);
            const submissions = await Submission.find({ course: { $in: courseIds } });
            // Add any categorization or additional logic here
            res.json(submissions);
        } catch (error) {
            console.error('Failed to fetch submissions for teacher:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async findSubmissionsForLoggedInStudent(req, res) {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: "Access denied. Available only for students." });
        }
    
        try {
            const studentId = req.user.id; // Assuming this is the authenticated user's ID from the token/session
            // Fetch submissions where the 'student' field matches the logged-in user's ID
            const submissions = await Submission.find({ student: studentId });
            if (!submissions) {
                return res.status(404).json({ message: "No submissions found for the logged-in student." });
            }
            res.json(submissions);
        } catch (error) {
            console.error('Failed to fetch submissions for the logged-in student:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = { SubmissionController, upload, deleteFileFromS3 };
