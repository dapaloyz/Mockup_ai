import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-dark-card shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-light-text tracking-wider">
          AI Product Mockup Generator
        </h1>
        <nav>
          <ul className="flex items-center space-x-6 text-sm">
            <li>
              <a href="#" className="text-medium-text hover:text-light-text transition-colors duration-200">
                Gallery
              </a>
            </li>
            <li>
              <a href="#" className="text-medium-text hover:text-light-text transition-colors duration-200">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="text-medium-text hover:text-light-text transition-colors duration-200">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};