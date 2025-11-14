import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400',
    secondary: 'bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-900'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
};