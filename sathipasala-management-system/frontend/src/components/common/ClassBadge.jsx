import React from 'react';

const ClassBadge = ({ classCode, showSinhala = true }) => {
  // Get class details based on class code
  const getClassDetails = (code) => {
    switch(code) {
      case 'ADH': 
        return { 
          name: 'Adhiṭṭhāna', 
          nameSi: 'අධිඨාන',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-300' 
        };
      case 'MET': 
        return { 
          name: 'Mettā', 
          nameSi: 'මෙත්තා',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
        };
      case 'KHA': 
        return { 
          name: 'Khanti', 
          nameSi: 'ඛන්ති',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
        };
      case 'NEK': 
        return { 
          name: 'Nekkhamma', 
          nameSi: 'නෙක්කම්ම',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
        };
      default: 
        return { 
          name: 'Unknown', 
          nameSi: 'නොදන්නා',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' 
        };
    }
  };
  
  const classInfo = getClassDetails(classCode);
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${classInfo.color}`}>
      {classInfo.name}
      {showSinhala && ` (${classInfo.nameSi})`}
    </span>
  );
};

export default ClassBadge;