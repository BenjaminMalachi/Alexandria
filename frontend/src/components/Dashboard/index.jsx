import React, { useEffect, useState } from 'react';
import NavBar from '../NavBar';

const Dashboard = () => {
    const [userRole, setUserRole] = useState('');
    const [userData, setUserData] = useState({
        courses: [],
        submissions: [],
        adminData: {
            userCount: 0,
            adminCount: 0,
            studentCount: 0,
            courseCount: 0,
        },
    });

    useEffect(() => {
        console.log('useEffect triggered');
        let role = localStorage.getItem('userRole'); // Use let instead of const
        if (!role) {
            console.log('No userRole found, setting default for testing');
            role = 'admin'; // Now this reassignment is allowed
            localStorage.setItem('userRole', role); // For debugging purposes
        }
        setUserRole(role);
        fetchDashboardData(role);
    }, []);

    const fetchDashboardData = async (role) => {
        console.log('Fetching data for role:', role);
        if (role === 'admin') {
            try {
                const response = await fetch('/api/admin/statistics', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch admin dashboard data');
                }
                const adminData = await response.json();
                console.log('Data fetched:', data);
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
                    fetch('/api/teacher/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                    fetch('/api/teacher/submissions', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                ]);

                const coursesData = await coursesResponse.json();
                console.log('courses Data fetched:', data);
                const submissionsData = await submissionsResponse.json();
                console.log('submissions Data fetched:', data);

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
                const coursesResponse = await fetch('/api/student/courses', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const coursesData = await coursesResponse.json();
                console.log('courses Data fetched:', data);

                const submissionsResponse = await fetch('/api/student/submissions', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const submissionsData = await submissionsResponse.json();
                console.log('submission Data fetched:', data);

                setUserData(currentData => ({
                    ...currentData,
                    courses: coursesData,
                    submissions: submissionsData,
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
                {userRole === 'admin' && (
                    <div>
                        <h2>Platform Summary</h2>
                        <p>Total Users: {userData.adminData.userCount}</p>
                        <p>Admins: {userData.adminData.adminCount}</p>
                        <p>Students: {userData.adminData.studentCount}</p>
                        <p>Total Courses: {userData.adminData.courseCount}</p>
                    </div>
                )}

                {userRole === 'teacher' && (
                    <div>
                        <h2>My Courses</h2>
                        <div>
                            {userData.courses.map((course) => (
                                <div key={course.id}>{course.name}</div> // Adjust according to your data structure
                            ))}
                        </div>
                        <h2>Submissions</h2>
                        <div>
                            <p>Outstanding: {userData.submissions.outstanding}</p>
                            <p>To Grade: {userData.submissions.toGrade}</p>
                        </div>
                    </div>
                )}

                {userRole === 'student' && (
                    <div>
                        <h2>My Courses</h2>
                        <div>
                            {userData.courses.map((course) => (
                                <div key={course.id}>
                                    <h3>{course.name}</h3>
                                    <p>{course.description}</p>
                                </div>
                            ))}
                        </div>
                        <h2>My Submissions</h2>
                        <div>
                            {userData.submissions.map((submission) => (
                                <div key={submission.id}>
                                    <h3>{submission.assignmentName}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;