import { Link } from 'react-router-dom';
import './navBar.css';
import apiRequest from '../../apiRequest';
import React, { useEffect } from 'react';

function NavBar() {
  return (
    <nav className="bg-marble text-deepBrown flex justify-between items-center p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center" style={{ marginLeft: '-372px' }}>
            <span className="text-3xl font-bold tracking-tight">Alexandria</span>
        </Link>
        <div className="flex items-center space-x-10">
          <Link to="/dashboard" className="text-xl font-semibold hover:text-sunset">Home</Link>
          <Link to="/about" className="text-xl font-semibold hover:text-sunset">About</Link>
          <Link to="/courses" className="text-xl font-semibold hover:text-sunset">Courses</Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
