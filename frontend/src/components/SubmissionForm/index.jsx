import React, { useState, useEffect } from 'react';

function SubmissionForm({ hwId, mode, onClose, initialSubmission, studentId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submission, setSubmission] = useState(initialSubmission || null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('answer', submissionText);
    formData.append('student', studentId); // Assuming studentId holds the student identifier
    formData.append('homework', hwId); // Assuming hwId holds the homework identifier
    // Include other form data as needed

    // Log formData contents
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    // Adjust endpoint URL and method based on the mode
    const endpoint = mode === 'submit' ? `${import.meta.env.VITE_API_URL}/api/submission` : `${import.meta.env.VITE_API_URL}/api/submission/${initialSubmission._id}`;
    const method = mode === 'submit' ? 'POST' : 'PATCH'; // Assuming PUT is used for edits

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(endpoint, {
        method: method,
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Invoke onSuccess callback after successful submission/update
        if (onSuccess) {
          onSuccess();
        }
        onClose(); // Close the form
      } else {
        // Handle error
        const errorText = await response.text();
        console.error('Submission error:', errorText);
        // Display error message to user
      }
    } catch (error) {
      console.error('Submission failed', error);
      // Display error message to user
    }

  };

  useEffect(() => {
    // Generate a preview if file is selected
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview('');
    }
  }, [file]);

  useEffect(() => {
    // Populate form if editing an existing submission
    if (mode === 'edit' && submission) {
      setSubmissionText(submission.text);
      setFilePreview(submission.fileUrl);
    }
  }, [mode, submission]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-marble p-8 rounded-lg shadow-lg max-w-md w-full relative">
        {/* Close button */}
        <button 
          type="button" 
          onClick={onClose}
          className="absolute top-0 right-0 mt-2 mr-2 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
  
        {/* Form elements */}
        <textarea 
          value={submissionText} 
          onChange={(e) => setSubmissionText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Your answer here..."
        />
        <input 
          type="file" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
        {filePreview && (
          <div className="mt-4 flex justify-center items-center flex-col">
            <button 
              type="button" 
              onClick={() => setFile(null)}
              className="text-white bg-sunset hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              Remove File
            </button>
          </div>
        )}
        <button 
          type="submit"
          className="mt-4 w-full bg-deepGreen hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {mode === 'submit' ? 'Submit' : 'Save changes'}
        </button>
      </form>
    </div>
  );
  
}

export default SubmissionForm;