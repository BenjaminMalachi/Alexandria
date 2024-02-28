import React, { useState, useEffect } from 'react';
import NavBar from '../NavBar';
import { useParams } from 'react-router-dom';
import SubmissionForm from '../SubmissionForm';

function Course() {
  const { id } = useParams();
  const [userId, setUserId] = useState('');
  const [course, setCourse] = useState(null);
  const [homework, setHomework] = useState([]);
  const [role, setRole] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false); // To control form visibility
  const [selectedHomeworkId, setSelectedHomeworkId] = useState(null); // To know which homework is being submitted/edited
  const [submissions, setSubmissions] = useState({}); // To store student submissions keyed by homework ID
  const [formMode, setFormMode] = useState('submit'); 

  useEffect(() => {
    const fetchUserRoleAndSubmissions = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        if(payload) {
          if(payload.role) {
            setRole(payload.role); // Set user role
          }
          if(payload.id) { // Assuming 'id' is the field in your JWT payload
            setUserId(payload.id); // Set user ID
          }
        } else {
          console.error('Payload is empty');
        }
      } else {
        console.error('No token found in localStorage');
      }
    };
  
    fetchUserRoleAndSubmissions().catch(error => console.error('Failed to load user role or submissions:', error));
  }, [id]); // Runs when component mounts or 'id' changes

  useEffect(() => {
    // Fetch course details from your API
    const fetchCourseAndHomework = async () => {
        // Fetch course details
        const courseResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const courseData = await courseResponse.json();
        setCourse(courseData);
  
        // Fetch homework assignments for the course
        const homeworkResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/homework?courseId=${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const homeworkData = await homeworkResponse.json();
        setHomework(homeworkData);
      };
  
      fetchCourseAndHomework().catch(error => {
        console.error('Failed to load course or homework:', error.message);
        // Handle errors (e.g., show error message, redirect to login)
      });
    }, [id]);
  
    if (!course) return <div>Loading...</div>;

    const handleEditClick = (hwId) => {
      setSelectedHomeworkId(hwId);
      setFormMode('edit');
      setShowSubmitForm(true); // Open the form
    };
  
    const handleSubmitClick = (hwId) => {
      console.log('Setting selectedHomeworkId to:', hwId);
      setSelectedHomeworkId(hwId);
      setFormMode('submit');
      setShowSubmitForm(true); // Open the form
    };

    return (
      <>
        <NavBar />
        <div>
          {role === 'student' && (
            <>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              {/* Display other course details as needed */}
              <h3>Homework Assignments</h3>
              {Array.isArray(homework) && (
                <ul>
                  {homework.map((hw) => (
                    <li key={hw._id}>
                      <strong>{hw.title}</strong>: {hw.description} (Due: {new Date(hw.dueDate).toLocaleDateString()})
                      {/* Check if student has submitted this homework */}
                      {submissions[hw._id] ? (
                        <>
                          <button onClick={() => handleEditClick(hw._id)}>Edit Submission</button>
                          <button onClick={() => handleDeleteSubmission(hw._id)}>Delete Submission</button>
                          {/* Display submission details here */}
                        </>
                      ) : (
                        <button onClick={() => handleSubmitClick(hw._id)}>Submit</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {/* Conditionally render the submission form as an overlay */}
              <SubmissionForm
                hwId={selectedHomeworkId}
                studentId={userId}
                mode={showSubmitForm}
                onClose={() => {
                  setShowSubmitForm(false);
                  setSelectedHomeworkId(null); // Reset selectedHomeworkId when the form is closed
                }}
              />
            </>
          )}
    
          {role === 'teacher' && ( //Need to work on this the submission for the teachers homework.map is not going to show submissions bc HW dont have submission data
            <ul>
              {homework.map((hw) => (
                <li key={hw._id}>
                  <strong>{hw.title}</strong>: {hw.description} (Due: {new Date(hw.dueDate).toLocaleDateString()})
                  {/* Ensure submissions exist and is an array */}
                  {Array.isArray(hw.submissions) && hw.submissions.map((submission) => (
                    <div key={submission._id}>
                      <span>{submission.studentName}'s submission</span>
                      <button onClick={() => openMarkSubmissionForm(submission._id)}>Mark Submission</button>
                      {/* Optionally display a link or button to download/view the submitted file */}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );    
    
    }
    
    export default Course;
