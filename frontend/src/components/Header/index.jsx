import './header.css';
import apiRequest from '../../apiRequest';
import React, { useEffect } from 'react';

function Header() {
  return (
    <header className="bg-marble text-deepBrown flex justify-between items-center p-4 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">
        Alexandria
        </h1>
        <div className="flex items-center">
        {/* You can add additional buttons or icons here, if needed */}
        </div>
    </header>
  );
}

export default Header;
