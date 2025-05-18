import React from 'react';
import { Link } from 'react-router-dom';

const ActionButton = ({ type, to, onClick, label }) => {
  // Get icon as SVG instead of using react-icons
  const getIcon = () => {
    switch(type) {
      case 'view':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        );
      case 'edit':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        );
      case 'delete':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Get button style
  const getButtonStyle = () => {
    switch(type) {
      case 'view':
        return 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200';
      case 'edit':
        return 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200';
      case 'delete':
        return 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200';
      default:
        return '';
    }
  };
  
  const baseClasses = "flex items-center px-3 py-1.5 rounded-md border transition-all";
  const buttonClasses = `${baseClasses} ${getButtonStyle()}`;
  
  return to ? (
    <Link to={to} className={buttonClasses}>
      {getIcon()}
      <span className="ml-1.5 text-sm">{label}</span>
    </Link>
  ) : (
    <button onClick={onClick} className={buttonClasses}>
      {getIcon()}
      <span className="ml-1.5 text-sm">{label}</span>
    </button>
  );
};

export default ActionButton;