import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';

// Import Lottie animations
import viewAnimation from '../../assets/animations/view-animation.json';
import editAnimation from '../../assets/animations/edit-animation.json';
import deleteAnimation from '../../assets/animations/delete-animation.json';

const AnimatedActionButton = ({ type, to, onClick, label }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Select the appropriate animation based on type
  const getAnimation = () => {
    switch(type) {
      case 'view':
        return viewAnimation;
      case 'edit':
        return editAnimation;
      case 'delete':
        return deleteAnimation;
      default:
        return null;
    }
  };
  
  // Get the appropriate color styles based on type
  const getColorStyles = () => {
    switch(type) {
      case 'view':
        return 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300';
      case 'edit':
        return 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300';
      case 'delete':
        return 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300';
      default:
        return '';
    }
  };
  
  // Render either a Link or a button based on if "to" prop is provided
  if (to) {
    return (
      <Link
        to={to}
        className={`flex items-center ${getColorStyles()}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={label}
      >
        <div className="w-6 h-6 mr-1">
          <Lottie
            animationData={getAnimation()}
            loop={isHovered}
            autoplay={isHovered}
            style={{ width: 24, height: 24 }}
          />
        </div>
        <span>{label}</span>
      </Link>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center ${getColorStyles()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={label}
    >
      <div className="w-6 h-6 mr-1">
        <Lottie
          animationData={getAnimation()}
          loop={isHovered}
          autoplay={isHovered}
          style={{ width: 24, height: 24 }}
        />
      </div>
      <span>{label}</span>
    </button>
  );
};

export default AnimatedActionButton;