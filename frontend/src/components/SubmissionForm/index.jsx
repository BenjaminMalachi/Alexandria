import React, { useState, useEffect } from 'react';

function SubmissionForm({ hwId, mode, onClose, initialSubmission, studentId }) {
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
          // If you have an auth token or need to set other headers:
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // Handle success
          onClose(); // Close the form
          // Optionally, reset form state here
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

  // Additional useEffect to populate form if editing an existing submission
  useEffect(() => {
    if (mode === 'edit' && submission) {
      setSubmissionText(submission.text);
      // Assume submission.fileUrl is the URL to the existing file
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
    <div className="submission-form-overlay">
      <form onSubmit={handleSubmit}>
        {/* Your existing form elements */}
        <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} />
        <input type="file" onChange={handleFileChange} />
        {filePreview && (
          <div>
            <img src={filePreview} alt="Preview" style={{ width: '100px', height: 'auto' }} />
            <button type="button" onClick={() => setFile(null)}>Remove File</button>
          </div>
        )}
        <button type="submit">{mode === 'submit' ? 'Submit' : 'Save changes'}</button>
      </form>
    </div>
  );
}

export default SubmissionForm;