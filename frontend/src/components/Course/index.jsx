import React, { useState, useEffect } from 'react';
import NavBar from '../NavBar';
import { useParams, Link } from 'react-router-dom';
import SubmissionForm from '../SubmissionForm';
import dunes from '../../assets/dunes.jpg';

const decodeJWT = (token) => {
  try {
      const base64Url = token.split('.')[1]; // JWT payload is the second part of the token
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = decodeURIComponent(atob(base64).split('').map(function(c) {
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
  const [homework, setHomework] = useState([]);
  const [role, setRole] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [formMode, setFormMode] = useState('submit');
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJWT(token);
      setUserId(payload.id);
      fetchCourseDetails(token);
      fetchHomeworkDetails(token);
      if (payload.role === 'student') {
        setRole(payload.role);
        fetchSubmissions(token, payload.id);
      }
    }
  }, [id]);

  const fetchCourseDetails = async (token) => {
    const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/courses/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setCourse(data);
  };

  const fetchHomeworkDetails = async (token) => {
    const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/homework?courseId=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setHomework(data);
  };

  const fetchSubmissions = async (token, userId) => {
    const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/student/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    if (Array.isArray(data)) {
      const submissionsMap = data.reduce((acc, submission) => {
        acc[submission.homework] = submission;
        return acc;
      }, {});
      setSubmissions(submissionsMap);
    } else {
      console.error('Submissions fetch did not return an array:', data);
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
      await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/${submissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const updatedSubmissions = { ...submissions };
      delete updatedSubmissions[submissionId];
      setSubmissions(updatedSubmissions);
      setShowSuccessOverlay(true);
      setTimeout(() => setShowSuccessOverlay(false), 3000);
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

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
                  {/* Check if there's a submission for the homework */}
                  {submissions[hw._id] ? (
                    <>
                      <table className="mt-4 w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3 px-6">Answer</th>
                            <th scope="col" className="py-3 px-6">File</th>
                            <th scope="col" className="py-3 px-6">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white border-b">
                            <td className="py-4 px-6">{submissions[hw._id].answer}</td>
                            <td className="py-4 px-6">
                              {submissions[hw._id].fileUpload ? (
                                <a href={`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/file/${submissions[hw._id].fileUpload.s3Key}`} target="_blank" rel="noopener noreferrer">Download File</a>
                              ) : 'No File'}
                            </td>
                            <td className="py-4 px-6">
                              <button className="font-medium text-blue-600 hover:underline" onClick={() => handleEditClick(hw._id)}>Edit</button>
                              <button className="font-medium text-red-600 hover:underline ml-4" onClick={() => handleDeleteSubmission(submissions[hw._id]._id)}>Delete</button>
                            </td>
                          </tr>
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
            <ul>
              {homework.map((hw) => (
                <li key={hw._id} className="mb-2.5">
                  <strong className="text-indigo-800">{hw.title}</strong>: {hw.description} (Due: {new Date(hw.dueDate).toLocaleDateString()})
                  {Array.isArray(hw.submissions) && hw.submissions.map((submission) => (
                    <div key={submission._id} className="mt-1.5 pl-5">
                      <span>{submission.studentName}'s submission</span>
                      <button className="ml-2 bg-orange-500 text-white p-1 rounded hover:bg-orange-600" onClick={() => openMarkSubmissionForm(submission._id)}>Mark Submission</button>
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
