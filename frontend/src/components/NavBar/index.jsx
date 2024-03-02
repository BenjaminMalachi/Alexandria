import { Link, useNavigate  } from 'react-router-dom';
import './navBar.css';
import React from 'react';

function NavBar() {
  const navigate  = useNavigate (); // Use useHistory hook for navigation

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    // If needed, add any additional steps to invalidate the token on the backend here
    navigate('/'); // Redirect user to the login page or home page after logout
  };

  return (
    <nav className="bg-marble text-deepBrown flex justify-between items-center p-5 shadow-lg">
        {/* Removed inline style for marginLeft */}
        <Link to="/dashboard" className="flex items-center">
          <span className="text-3xl font-bold tracking-tight">Alexandria</span>
        </Link>
        <div className="flex items-center space-x-10">
          <Link to="/dashboard" className="text-xl font-semibold hover:text-sunset">Home</Link>
          <Link to="/dashboard" className="text-xl font-semibold hover:text-sunset">About</Link>
          <Link to="/dashboard" className="text-xl font-semibold hover:text-sunset">Courses</Link>
          <button onClick={handleLogout} className="text-xl font-semibold hover:text-sunset">Logout</button> {/* Add a logout button */}
        </div>
    </nav>
  );
}

export default NavBar;
