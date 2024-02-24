import { Link } from 'react-router-dom';
import './navBar.css';
import apiRequest from '../../apiRequest';
import React, { useEffect } from 'react';

function NavBar() {
  return (
      <nav className="flex justify-between items-center">
          <Link to="/" className="text-sunset hover:text-spinach">Home</Link>
          <Link to="/about" className="text-sunset hover:text-spinach">About</Link>
          <Link to="/courses" className="text-sunset hover:text-spinach">Courses</Link>
      </nav>
  );
}

export default NavBar;
