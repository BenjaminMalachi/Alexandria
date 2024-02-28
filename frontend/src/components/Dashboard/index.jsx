import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';
import { Link } from 'react-router-dom';
import SubmissionForm from '../SubmissionForm';

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

const Dashboard = () => {
    const [role, setRole] = useState('');
    const [editingSubmission, setEditingSubmission] = useState(null);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [userId, setUserId] = useState('');
    const [userData, setUserData] = useState({
        adminData: { userCount: 0, adminCount: 0, studentCount: 0, courseCount: 0 },
        courses: [],
        submissions: [],
        homeworks: []
    });

    useEffect(() => {
        console.log('Fetching dashboard data based on user role');
        const token = localStorage.getItem('token'); // Make sure you retrieve the token correctly
        if (token) {
            const payload = decodeJWT(token);
            if(payload && payload.role) {
                localStorage.setItem('role', payload.role);
                setRole(payload.role); // Update the role state
                // Fetch dashboard data based on role
                fetchDashboardData(payload.role);
            } else {
                console.error('No role found in token payload');
                // Handle no role in payload
            }
            if(payload.id) {
                setUserId(payload.id);
            } else {
                console.error('No id found in token payload');
                // Handle no role in payload
            }
        } else {
            console.error('No token found in localStorage');
            // Handle no token found
        }
    }, []);

    //handleDeleteSubmission
    const handleDeleteSubmission = async (submissionId) => {
        if (window.confirm('Are you sure you want to delete this submission?')) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submission/${submissionId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
            });
            if (!response.ok) {
              throw new Error('Failed to delete submission');
            }
            // On successful deletion, remove the submission from the local state to update the UI
            setUserData((currentData) => ({
              ...currentData,
              submissions: currentData.submissions.filter(submission => submission._id !== submissionId),
            }));
          } catch (error) {
            console.error('Error deleting submission:', error);
          }
        }
    };

    //handleEditSubmission
    const handleEditSubmission = (submission) => {
        console.log('submission data sent for edting:', submission);
        setEditingSubmission(submission);
        setSelectedHomeworkId(submission.homework);
        setShowSubmitForm(true); // Assuming you manage the form visibility with this state
    };

    const fetchDashboardData = async (role) => {
        console.log('Fetching data for role:', role);
        if (role === 'admin') {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/statistics`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch admin dashboard data');
                }
                const adminData = await response.json();
                console.log('Data fetched:', response);
                setUserData(currentData => ({
                    ...currentData,
                    adminData: {
                        userCount: adminData.userCount,
                        adminCount: adminData.adminCount,
                        studentCount: adminData.studentCount,
                        courseCount: adminData.courseCount,
                    },
                }));
            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            }

        } else if (role === 'teacher') {

            try {
                const [coursesResponse, submissionsResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/courses`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/submission`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                ]);

                const coursesData = await coursesResponse.json();
                console.log('courses Data fetched:', coursesData);
                const submissionsData = await submissionsResponse.json();
                console.log('submissions Data fetched:', submissionsData);

                setUserData(currentData => ({
                    ...currentData,
                    courses: coursesData,
                    submissions: submissionsData,
                }));
            } catch (error) {
                console.error('Error fetching teacher dashboard data:', error);
            }

        } else if (role === 'student') {
            try {
                const token = localStorage.getItem('token'); // Re-fetch the token
                if (!token) {
                    console.error('Token not found');
                    return;
                }
                const decodedPayload = decodeJWT(token); // Decode the token to get the payload
                if (!decodedPayload) {
                    console.error('Failed to decode token');
                    return;
                }
                const studentId = decodedPayload.id; // Replace 'sub' with the correct property name for student ID
        
                // FETCH courses
                const coursesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                let coursesData = await coursesResponse.json();
                console.log('courses Data fetched:', coursesData);
        
                // Filter courses to include only those the student is enrolled in
                coursesData = coursesData.filter(course => course.students.includes(studentId));
        
                //FETCH submissions
                const submissionsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/submission/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const submissionsData = await submissionsResponse.json();
                console.log('submission Data fetched:', submissionsData);

                //FETCH homeworks
                const homeworksResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/homework?courses=${coursesData.map(course => course._id).join(',')}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                let homeworksData = await homeworksResponse.json();
                console.log('homeworks Data fetched:', homeworksData);
        
                setUserData(currentData => ({
                    ...currentData,
                    courses: coursesData,
                    submissions: submissionsData,
                    homeworks: homeworksData,
                }));
            } catch (error) {
                console.error('Error fetching student dashboard data:', error);
            }

        }        
        
    };

    return (
        <>
            <NavBar />
            <div>
                {role === 'admin' && (
                    <div>
                        <h2>Platform Summary</h2>
                        <p>Total Users: {userData.adminData.userCount}</p>
                        <p>Admins: {userData.adminData.adminCount}</p>
                        <p>Students: {userData.adminData.studentCount}</p>
                        <p>Total Courses: {userData.adminData.courseCount}</p>
                    </div>
                )}

                {role === 'teacher' && (
                    <div>
                        <h2>My Courses</h2>
                        <div>
                            {userData.courses.length > 0 ? userData.courses.map((course) => (
                                <div key={course._id}><Link to={`/course/${course._id}`}>{course.title}</Link></div>
                            )) : <p>No courses available.</p>}
                        </div>
                        <h2>Submissions</h2>
                        <div>
                            <p>Outstanding: {userData.submissions.outstanding}</p>
                            <p>To Grade: {userData.submissions.toGrade}</p>
                        </div>
                    </div>
                )}

                {role === 'student' && (
                    <div>
                        <h2>My Courses</h2>
                        <div>
                            {userData.courses.length > 0 ? userData.courses.map((course) => (
                                <div key={course._id}>
                                    <h3><Link to={`/course/${course._id}`}>{course.title}</Link></h3>
                                    <p>{course.description}</p>
                                </div>
                            )) : <p>No courses enrolled.</p>}
                        </div>
                        <h2>My Submissions</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Homework</th>
                                        <th>Answer</th>
                                        <th>File</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userData.submissions.map((submission) => {
                                        // Directly accessing the homework object from the submission
                                        const homework = userData.homeworks.find(hw => hw._id === submission.homework);
                                        // Accessing the course title directly from the homework's nested course object
                                        const courseName = homework && homework.course ? homework.course.title : 'Unknown Course';
                                            return (
                                                <tr key={submission._id}>
                                                    <td>{courseName}</td>
                                                    <td>{homework ? homework.title : 'Unknown Homework'}</td>
                                                    <td>{submission.answer}</td>
                                                    <td>
                                                        {submission.fileUpload && (
                                                            <>
                                                            <i className="file icon"></i> {/* Icon for file */}
                                                            {submission.fileUpload.s3Key} {/* Filename or some identifier */}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button onClick={() => handleEditSubmission(submission)}>Edit</button>
                                                        <button onClick={() => handleDeleteSubmission(submission._id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            );
                                    })}
                                </tbody>
                            </table>
                            {showSubmitForm && (
                                <div className="overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                                    <div className="form-container" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', maxWidth: '500px', width: '100%', boxSizing: 'border-box' }}>
                                        <SubmissionForm
                                            hwId={editingSubmission.homework}
                                            studentId={userId}
                                            mode={editingSubmission ? 'edit' : 'submit'}
                                            initialSubmission={editingSubmission}
                                            onClose={() => {
                                            setShowSubmitForm(false);
                                            setEditingSubmission(null);
                                            setSelectedHomeworkId(null); // Reset editing submission on form close
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;