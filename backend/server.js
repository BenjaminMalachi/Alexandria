// Import express and other necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const createError = require('http-errors');
require('dotenv').config();

// Create express app
const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas', err));

// Middleware
app.use(cors());
app.use(express.json());

// Route handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Simple route for GET request
app.get('/', (req, res) => {
  res.send('Hello, Alexandria LMS!');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const response = {
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  };

  // send the error response as JSON
  res.status(err.status || 500).json(response);
});

module.exports = app;