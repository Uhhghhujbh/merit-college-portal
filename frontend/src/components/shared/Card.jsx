import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow ${className}`}>
    {children}
  </div>
);