import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-dark-card shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-light-text tracking-wider">
          AI Product Mockup Generator
        </h1>
      </div>
    </header>
  );
};
