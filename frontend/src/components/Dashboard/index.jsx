import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';
import { Link } from 'react-router-dom';
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

const Dashboard = () => {
    const [role, setRole] = useState('');
    const [editingSubmission, setEditingSubmission] = useState(null);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [userId, setUserId] = useState('');
    const [gradingInfo, setGradingInfo] = useState({});
    const [grades, setGrades] = useState({});
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [userData, setUserData] = useState({
        adminData: { userCount: 0, adminCount: 0, studentCount: 0, courseCount: 0 },
        courses: [],
        submissions: [],
        homeworks: [],
        
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
            const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/${submissionId}`, {
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

    const fetchDashboardData = async (role, userId) => {
        console.log('Fetching data for role:', role);
        if (role === 'admin') {
            try {
                const response = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/admin/statistics`, {
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
              const token = localStorage.getItem('token');
              const teacherId = decodeJWT(token).id; // Decode the token to get the teacher's ID
        
              // Fetch courses first
              const coursesResponse = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/courses/teacher/courses`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const coursesData = await coursesResponse.json();
              console.log('courses Data fetched:', coursesData);
              
              // Now that you have coursesData, you can use it to fetch homeworks
              const homeworksResponse = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/homework?courses=${coursesData.map(course => course._id).join(',')}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const homeworksData = await homeworksResponse.json();
              console.log('homeworks Data fetched:', homeworksData);
              
              // Fetch submissions
              const submissionsResponse = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const submissionsData = await submissionsResponse.json();
        
              // Calculate the number of outstanding and to grade submissions
              let outstanding = 0;
              let toGrade = 0;

              homeworksData.forEach(homework => {
                // Get students enrolled in the course associated with the homework
                const enrolledStudents = homework.course.students;
                let submittedCount = 0; // Track number of submissions for this homework
              
                enrolledStudents.forEach(studentId => {
                  // Check if there is a submission by this student for the current homework
                  const submission = submissionsData.find(submission => submission.student === studentId && submission.homework === homework._id);
                  
                  if (submission) {
                    submittedCount++;
                    if (!submission.grade) {
                      // Submission exists but not graded yet
                      toGrade++;
                    }
                  }
                });
              
                // Calculate outstanding submissions
                // If not all students submitted their homework, increment outstanding
                if (submittedCount < enrolledStudents.length) {
                  outstanding += (enrolledStudents.length - submittedCount);
                }
              });
              
              // Update state or log results
              console.log(`To Grade: ${toGrade}, Outstanding: ${outstanding}`);
            
            // Adjust "Outstanding" to not include submissions that have been made
            // This ensures we're only counting homeworks that have no submissions
            outstanding = Math.max(outstanding, 0);
        
              // Set state with new data
              setUserData(currentData => ({
                ...currentData,
                courses: coursesData,
                submissions: submissionsData,
                homeworks: homeworksData,
                outstanding,
                toGrade
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
                const coursesResponse = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/courses/student/courses`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                let coursesData = await coursesResponse.json();
                console.log('courses Data fetched:', coursesData);
        
                // Filter courses to include only those the student is enrolled in
                const filteredCourses = coursesData.filter(course => course.students.some(student => student._id === studentId));
                console.log('filteredCourses Data fetched:', filteredCourses);
        
                //FETCH submissions
                const submissionsResponse = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/submission/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const submissionsData = await submissionsResponse.json();
                console.log('submission Data fetched:', submissionsData);

                //FETCH homeworks
                const homeworksResponse = await fetch(`${import.meta.env.REACT_APP_API_BASE_URL}/api/homework?courses=${coursesData.map(course => course._id).join(',')}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                let homeworksData = await homeworksResponse.json();
                console.log('homeworks Data fetched:', homeworksData);
        
                setUserData(currentData => ({
                    ...currentData,
                    courses: filteredCourses,
                    submissions: submissionsData,
                    homeworks: homeworksData,
                }));

            } catch (error) {
                console.error('Error fetching student dashboard data:', error);
            };

        };        
        
    };

    //Render Logic & Component
    return (
        <>
            <NavBar />
            <div className="flex flex-col h-dvh" style={{
                backgroundImage: `url(${dunes})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                }}>
                {/* Admin Dashboard */}
                {role === 'admin' && (
                    <div className="flex-grow space-y-6 p-4">
                        <div className="bg-marble p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-deepBrown mb-4">Platform Summary</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <p>Total Users: {userData.adminData.userCount}</p>
                                <p>Admins: {userData.adminData.adminCount}</p>
                                <p>Students: {userData.adminData.studentCount}</p>
                            </div>
                        </div>
                        <div className="bg-marble p-6 rounded-lg shadow-md">
                            <p>Total Courses: {userData.adminData.courseCount}</p>
                        </div>
                    </div>
                )}

                {/* Teacher Dashboard */}
                {role === 'teacher' && (
                    <div className="flex-grow space-y-6 p-4">
                        <div className="bg-marble p-6 rounded-lg shadow-md w-full">
                            {/* My Submissions */}
                            <div className="bg-marble p-6 rounded-lg shadow-m ">
                                <h2 className="text-4xl font-bold text-deepBrown mb-4 underline">Submissions</h2>
                                <div className='flex items-center justify-center text-deepBrown'>
                                    <div className='bg-desert w-1/2 mx-5 px-10 py-20 rounded-lg shadow-lg'>
                                        <span className="font-semibold">Outstanding: {userData.outstanding}</span>
                                    </div>
                                    <div className='bg-sunset w-1/2 mx-5 px-10 py-20 rounded-lg shadow-lg'>
                                        <span className="font-semibold">To Grade: {userData.toGrade}</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto text-deepBrown">
                                    {userData.submissions.some(submission => !submission.grade) ? (

                                        <table className="w-full">
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

                                                    const isGrading = gradingInfo[submission._id];
                                                    return (
                                                        <tr key={submission._id} className="border border-deepBrown hover:bg-gray-100">
                                                            <td className="py-3 px-6 text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center">
                                                                <span className="font-medium">{courseName}</span>
                                                            </div>
                                                            </td>
                                                            <td className="py-3 px-6 text-center">
                                                            <div className="flex justify-center">
                                                                <span>{homework ? homework.title : 'Unknown Homework'}</span>
                                                            </div>
                                                            </td>
                                                            <td className="py-3 px-6 text-center">
                                                            <span>{submission.answer}</span>
                                                            </td>
                                                            <td className="py-3 px-6 text-center">
                                                                {submission.fileUpload && (
                                                                    <>
                                                                        <i className="file icon"></i> {/* Icon for file */}
                                                                        <button
                                                                            onClick={() => handleDownloadFile(submission.fileUpload.s3Key)}
                                                                            className="ml-2 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                                                                        >
                                                                            Download File
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-6 text-center">
                                                            <div className="flex item-center justify-center">
                                                                {isGrading ? (

                                                                    <>
                                                                    <input
                                                                        type="text"
                                                                        className="input input-bordered bg-marble max-w-24"
                                                                        value={grades[submission._id] || ''}
                                                                        onChange={(e) => handleGradeChange(e, submission._id)} // Pass event and submission ID
                                                                    />
                                                                    <button 
                                                                        onClick={() => submitGrade(submission._id)}
                                                                        className="btn btn-xs bg-deepGreen text-white ml-2 self-center"
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
                                                        ); 
                                                })}
                                            </tbody>
                                        </table>

                                    ) : (

                                        <p className="text-center py-10">No Submissions to Grade</p>

                                    )}
                                </div> 

                                {/* Success Message Overlay */}
                                {showSuccessOverlay && (
                                    <div className="overlay" style={{
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 1050 // Ensure this is above your other content
                                    }}>
                                        <div className="message" style={{
                                            backgroundColor: 'white',
                                            padding: '20px',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}>
                                            Student successfully graded!
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                        <div className="bg-marble p-6 rounded-lg shadow-md w-full h-3/5">
                            {userData.courses.length > 0 ? userData.courses.map((course) => (
                                <div key={course._id} className="bg-oasisblue my-5 px-10 py-5 rounded-lg shadow-lg">
                                    <Link to={`/course/${course._id}`} className="text-xl font-bold text-deepBrown">{course.title}</Link>
                                </div>
                            )) : <p>No courses available.</p>}
                        </div>
                        
                    </div>
                )}

                {/* Student Dashboard */}
                {role === 'student' && (
                    <div className="flex-grow space-y-6 p-4">
                        {/* My Courses */}
                        <div className="bg-marble p-6 rounded-lg shadow-m h-2/4">
                            <h2 className="text-4xl font-bold text-deepBrown mb-4 underline">My Courses</h2>
                            <div className='flex items-center justify-center text-deepBrown'>
                                {userData.courses.length > 0 ? userData.courses.map((course) => (
                                    <div key={course._id} className="mx-5 px-10 py-20 rounded-lg shadow-md text-deepBrown" style={{ width: '250px', height: '250px' }}>
                                        <h3 className="font-semibold"><Link to={`/course/${course._id}`}>{course.title}</Link></h3>
                                        <p className="text-sm">{course.description}</p>
                                    </div>
                                )) : <p>No courses enrolled.</p>}
                            </div>
                        </div>

                        {/* My Submissions */}
                            <div className="bg-marble p-6 rounded-lg shadow-md h-2/5">
                            <h2 className="text-4xl font-bold text-deepBrown mb-4 underline">My Submissions</h2>
                            <div className="overflow-x-auto text-deepBrown">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Homework</th>
                                        <th>Answer</th>
                                        <th>Grade</th>
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
                                            <tr key={submission._id} className="border border-deepBrown hover:bg-gray-100">
                                                <td className="py-3 px-6 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center">
                                                    <span className="font-medium">{courseName}</span>
                                                </div>
                                                </td>
                                                <td className="py-3 px-6 text-center">
                                                <div className="flex justify-center">
                                                    <span>{homework ? homework.title : 'Unknown Homework'}</span>
                                                </div>
                                                </td>
                                                <td className="py-3 px-6 text-center">
                                                <span>{submission.answer}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                  {submission.grade || "Unmarked"}
                                                </td>
                                                <td className="py-3 px-6 text-center">
                                                {submission.fileUpload && (
                                                    <>
                                                    <i className="file icon"></i> {/* Icon for file */}
                                                    <span className="ml-2">{submission.fileUpload.s3Key}</span> {/* Filename or some identifier */}
                                                    </>
                                                )}
                                                </td>
                                                <td className="py-3 px-6 text-center">
                                                <div className="flex item-center justify-center">
                                                    <button 
                                                    onClick={() => handleEditSubmission(submission)} 
                                                    className="btn btn-xs btn-success text-white mr-2 bg-deepGreen"
                                                    >
                                                    Edit
                                                    </button>
                                                    <button 
                                                    onClick={() => handleDeleteSubmission(submission._id)}
                                                    className="btn btn-xs btn-error text-white bg-sunset"
                                                    >
                                                    Delete
                                                    </button>
                                                </div>
                                                </td>
                                            </tr>
                                            ); 
                                    })}
                                </tbody>
                            </table>
                            </div>
                        </div>
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