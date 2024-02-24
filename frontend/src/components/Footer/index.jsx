import './footer.css';
import apiRequest from '../../apiRequest';
import React, { useEffect } from 'react';

function Footer() {
  return (
      <footer className="bg-deepBrown text-marble flex justify-center items-center p-4">
          <p>&copy; {new Date().getFullYear()} Alexandria. All rights reserved.</p>
      </footer>
  );
}

export default Footer;
