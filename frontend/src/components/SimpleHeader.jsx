import React from 'react';
import { Link } from 'react-router-dom';

const SimpleHeader = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png"
                alt="Helagovi.lk Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-800">Helagovi.lk</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleHeader;