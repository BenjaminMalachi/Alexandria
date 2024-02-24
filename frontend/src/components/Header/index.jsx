import './header.css';
import apiRequest from '../../apiRequest';
import React, { useEffect } from 'react';

function Header() {
  return (
      <header className="bg-marble text-deepBrown flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">Alexandria</h1>
          <nav>
              {/* Navigation Links */}
          </nav>
      </header>
  );
}

export default Header;
