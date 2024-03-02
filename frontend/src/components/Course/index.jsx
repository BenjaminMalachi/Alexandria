import React, { useState, useEffect } from 'react';
import NavBar from '../NavBar';
import { useParams, Link } from 'react-router-dom';
import SubmissionForm from '../SubmissionForm';
import dunes from '../../assets/dunes.jpg';

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(payload);
  } catch (error) {
    console.error("Error decoding JWT", error);
    return null;
  }
};

function Course() {
  const { id } = useParams();
  const [userId, setUserId] = useState('');
  const [course, setCourse] = useState({});
  const [users, setUsers] = useState([]);
  const [grades, setGrades] = useState({});
  const [homework, setHomework] = useState([]);
  const [role, setRole] = useState('');
  const [gradingInfo, setGradingInfo] = useState({});
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [formMode, setFormMode] = useState('submit');
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [submissionUpdateTrigger, setSubmissionUpdateTrigger] = useState(0);
  const [allSubmissions, setAllSubmissions] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJWT(token);
      setUserId(payload.id);
      fetchCourseDetails();
      fetchHomeworkDetails();
      setRole(payload.role);
      if (payload.role === 'teacher') {
        fetchAllSubmissionsForCourse();
      } else if (payload.role === 'student') {
        fetchSubmissions(payload.id);
      }
    }
  }, [id, role]); // Added role as a dependency

  const fetchCourseDetails = async () => {
    const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/courses/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setCourse(data);
  
    // Assuming 'data' includes populated 'students' and 'teacher' fields
    // Combine teacher and students into a single array, ensuring teacher data structure matches students
    if (role === 'teacher') {
      const studentPromises = data.students.map(studentId => fetchUserDetails(studentId));
      // Assuming teacher data needs similar handling
      const teacherPromise = fetchUserDetails(data.teacher); // Adjust based on actual data structure
      Promise.all([...studentPromises, teacherPromise]).then(userDetails => {
        // Filter out any null responses and setUsers
        setUsers(userDetails.filter(Boolean));
      });
    }
  };

  const fetchUserDetails = async (userId) => {
    // Fetch user details for a given ID
    const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      console.error("Failed to fetch user details for ID:", userId);
      return null;
    }
    return response.json();
  };

  const fetchHomeworkDetails = async () => {
    const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/homework?courseId=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setHomework(data);
  };

  const fetchSubmissions = async (userId) => {
    const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/student/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    if (Array.isArray(data)) {
      const submissionsMap = data.reduce((acc, submission) => {
        if (!acc[submission.homework]) {
          acc[submission.homework] = [];
        }
        acc[submission.homework].push(submission);
        return acc;
      }, {});
      setSubmissions(submissionsMap);
    } else {
      console.error('Submissions fetch did not return an array:', data);
    }
  };

  const fetchAllSubmissionsForCourse = async () => {
    try {
      // Fetch all submissions for the course
      const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submissions/course/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const submissionsData = await response.json();
  
      // Organize submissions by homework ID and then by student ID
      const submissionsByHomework = submissionsData.reduce((acc, submission) => {
        if (!acc[submission.homework]) {
          acc[submission.homework] = {};
        }
        acc[submission.homework][submission.student] = submission;
        return acc;
      }, {});
  
      setAllSubmissions(submissionsByHomework);
    } catch (error) {
      console.error('Error fetching all submissions for the course:', error);
    }
  };

  const handleEditClick = (hwId) => {
    setSelectedHomeworkId(hwId);
    setFormMode('edit');
    setShowSubmitForm(true);
    const submissionToEdit = submissions[hwId];
    if (submissionToEdit) {
      setEditingSubmission(submissionToEdit);
    }
  };

  const handleSubmitClick = (hwId) => {
    setSelectedHomeworkId(hwId);
    setFormMode('submit');
    setShowSubmitForm(true);
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
  
    try {
      const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/${submissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
  
      if (response.ok) {
        // Instead of manually updating state, just trigger a re-fetch
        setSubmissionUpdateTrigger(prev => prev + 1);
      } else {
        console.error('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const onSubmissionSuccess = () => {
    setShowSubmitForm(false);
    setSubmissionUpdateTrigger(prev => prev + 1); // Increment trigger
  };
  
  // Adjust your useEffect to depend on this new trigger
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJWT(token);
      if (payload && payload.id) { // Ensure payload.id exists and is correctly extracted
        setUserId(payload.id);
        setRole(payload.role);
        fetchSubmissions(payload.id); // Pass the correctly extracted userID
      }
    }
  }, [id, submissionUpdateTrigger]); // Re-fetch when ID or submissionUpdateTrigger changes

  //Download file
  const handleDownloadFile = async (s3Key) => {
    try {
        const token = localStorage.getItem('token');
    
        // Check if the token exists
        if (!token) {
            console.error("No token found");
            return; // Optionally, handle this case more gracefully
        }

        const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/file/${s3Key}`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Include auth token if required
          },
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
    
        // Use the signed URL directly without trying to parse it as JSON
        window.open(data.url, '_blank'); // This will start the download or open the file in a new tab, depending on the file type and browser settings
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    //HandleGradeClick
    const handleGradeClick = (submissionId) => {
      setGradingInfo({ ...gradingInfo, [submissionId]: true });
    };
    
    //HandleGradeChange
    const handleGradeChange = (e, submissionId) => {
      const newGrade = e.target.value; // Correctly extract the text value from the input field
      setGrades({
        ...grades,
        [submissionId]: newGrade, // Ensure the new grade is a string/text
      });
    };

    //submitGrade
    const submitGrade = async (submissionId) => {
      const grade = grades[submissionId];
      if (!grade) {
          console.error('No grade entered for submission:', submissionId);
          return; // Optionally handle this case more gracefully
      }
      try {
          const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/${submissionId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grade }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to submit grade');
          }

          console.log('Grade submitted successfully:', submissionId, grade);
      
          // Assuming the backend responds with the updated submission
          const updatedSubmission = await response.json();
          setUserData(currentData => ({
            ...currentData,
            submissions: currentData.submissions.map(submission => 
              submission._id === submissionId ? updatedSubmission : submission
            ),
          }));
      
          // Clear the grade input field
          setGrades(prevGrades => {
              const updatedGrades = { ...prevGrades };
              delete updatedGrades[submissionId]; // or update it as needed
              return updatedGrades;
          });

          // Assuming you want to remove the submission from the grading state upon successful grade submission
          const updatedGradingInfo = { ...gradingInfo };
          delete updatedGradingInfo[submissionId];
          setGradingInfo(updatedGradingInfo);

          // Refresh the data to reflect the changes
          await fetchDashboardData(role); // Make sure this function is set up to re-fetch and update state accordingly

          // Show success message
          setShowSuccessOverlay(true);

          // Hide success message after a delay
          setTimeout(() => {
              setShowSuccessOverlay(false);
          }, 3000); // Adjust the timeout duration as needed
      
          } catch (error) {
              console.error('Error submitting grade:', error);
          }
      };

      console.log(submissions);

  return (
    <>
      <NavBar />
      <div className="flex flex-col h-screen" style={{
        backgroundImage: `url(${dunes})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {role === 'student' && (
          <div className="space-y-6 p-4">
            <div className="bg-marble p-6 rounded-lg shadow-lg">
              <h2 className="text-deepBrown text-4xl mb-4">{course.title}</h2>
              <p className="text-deepBrown text-lg">{course.description}</p>
            </div>
  
            <div className="bg-oasisblue p-6 rounded-lg shadow-lg">
              <h3 className="text-deepBrown text-3xl mb-4 font-semibold">Homework Assignments</h3>
              {homework.map((hw) => (
                <div key={hw._id} className="mb-4">
                  <strong className="text-deepBrown">{hw.title}</strong>: {hw.description} (Due: {new Date(hw.dueDate).toLocaleDateString()})
                  {/* Enhanced check for submission existence */}
                  {submissions[hw._id] && submissions[hw._id].length ? (
                    <>
                      <table className="mt-4 w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3 px-6">Answer</th>
                            <th scope="col" className="py-3 px-6">File</th>
                            <th scope="col" className="py-3 px-6">Grade</th>
                            <th scope="col" className="py-3 px-6">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Assuming submissions[hw._id] is an array of submissions, map through it */}
                          {submissions[hw._id].map((submission, index) => (
                            <tr key={index} className="bg-white border-b">
                              <td className="py-4 px-6">{submission.answer || 'No answer provided'}</td>
                              <td className="py-4 px-6">
                                {submission.fileUpload ? (
                                  <>
                                    <i className="file icon"></i> {/* Icon for file */}
                                    <button
                                      onClick={() => handleDownloadFile(submission.fileUpload.s3Key)}
                                      className="ml-2 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                                    >
                                      Download File
                                    </button>
                                  </>
                                ) : 'No File'}
                              </td>
                              <td className="py-4 px-6">
                                {submission.grade || "Unmarked"}
                              </td>
                              <td className="py-4 px-6">
                                <button className="font-medium text-blue-600 hover:underline" onClick={() => handleEditClick(hw._id)}>Edit</button>
                                <button className="font-medium text-red-600 hover:underline ml-4" onClick={() => handleDeleteSubmission(submission._id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <button className="ml-4 bg-deepGreen text-white p-1 rounded hover:bg-blue-600" onClick={() => handleSubmitClick(hw._id)}>Submit</button>
                  )}
                </div>
              ))}
              {showSubmitForm && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
                  <div className="bg-white p-5 rounded-lg max-w-md mx-auto">
                    <SubmissionForm
                      hwId={selectedHomeworkId}
                      studentId={userId}
                      initialSubmission={editingSubmission}
                      mode={formMode}
                      onClose={() => {
                        setShowSubmitForm(false);
                        setSelectedHomeworkId(null);
                        setEditingSubmission(null);
                      }}
                      onSuccess={onSubmissionSuccess}
                    />
                    <button
                      className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-sunset"
                      onClick={() => {
                        setShowSubmitForm(false);
                        setSelectedHomeworkId(null);
                        setEditingSubmission(null);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
      )}

      {role === 'teacher' && (
          <div className="space-y-6 p-4">
            <div className="bg-marble p-6 rounded-lg shadow-lg">
              <h2 className="text-deepBrown text-4xl mb-4">{course.title}</h2>
              <p className="text-deepBrown text-lg">{course.description}</p>
            </div>
            <div className="bg-marble shadow overflow-hidden sm:rounded-md my-4">
            <h3 className="text-deepBrown text-3xl mb-4 font-semibold pt-4">Enrolled Students</h3>
              <ul className="divide-y divide-gray-200">
                {users.map(user => (
                  <li key={user.id} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deepBrown">
                    {user.username} - {user.role}
                  </li>
                ))}
              </ul>
            </div>

            {/* Submissions list with grading feature */}
            <div className="mt-4">
              <div className="bg-oasisblue p-6 rounded-lg shadow-lg">
                  <h3 className="text-deepBrown text-3xl mb-4 font-semibold">Homework Assignments</h3>
                  {homework.map(hw => (
                    <div key={hw._id} className="mb-4">
                      <strong className="text-deepBrown">{hw.title}</strong>: {hw.description} (Due: {new Date(hw.dueDate).toLocaleDateString()})
                      {/* Assuming you adjust how submissions are stored/fetched to be an array per homework */}
                      {submissions[hw._id] && submissions[hw._id].length > 0 ? (
                        <table className="mt-4 w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th scope="col" className="py-3 px-6">Student</th>
                              <th scope="col" className="py-3 px-6">Answer</th>
                              <th scope="col" className="py-3 px-6">File</th>
                              <th scope="col" className="py-3 px-6">Grade</th>
                              <th scope="col" className="py-3 px-6">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                              {submissions[hw._id].map(submission => (
                                <tr key={submission._id} className="bg-white border-b">
                                  <td className="py-4 px-6">{submission.student}</td>
                                  <td className="py-4 px-6">{submission.answer}</td>
                                  <td className="py-4 px-6">
                                    {submission.fileUpload && (
                                      <>
                                        <i className="file icon"></i>
                                        <button
                                            onClick={() => handleDownloadFile(submission.fileUpload.s3Key)}
                                            className="ml-2 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                                        >
                                            Download File
                                        </button>
                                      </>
                                    )}
                                  </td>
                                  <td className="py-4 px-6">
                                    {submission.grade || "Unmarked"}
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        {gradingInfo[submission._id] ? (
                                          <>
                                            <input
                                                type="text"
                                                className="input input-bordered bg-marble max-w-xs"
                                                value={grades[submission._id] || ''}
                                                onChange={(e) => handleGradeChange(e, submission._id)}
                                            />
                                            <button 
                                                onClick={() => submitGrade(submission._id)}
                                                className="btn btn-xs bg-deepGreen text-white ml-2"
                                            >
                                            Submit Grade
                                            </button>
                                          </>
                                        ) : (
                                          <button 
                                              onClick={() => handleGradeClick(submission._id)} 
                                              className="btn btn-xs bg-deepGreen text-white"
                                          >
                                          Grade
                                          </button>
                                        )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                        </table>
                      ) : (
                        <p>No submissions for this homework.</p>
                      )}
                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}
    </div>
  </>
);    
}
    
export default Course;
