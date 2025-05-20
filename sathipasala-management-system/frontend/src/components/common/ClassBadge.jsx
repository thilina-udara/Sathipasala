import React from 'react';
import { useTranslation } from 'react-i18next';

const ClassBadge = ({ classCode }) => {
  const { t } = useTranslation();
  
  const getBadgeStyles = (code) => {
    switch(code) {
      case 'ADH':
        return 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600';
      case 'MET':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      case 'KHA':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'NEK':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };
  
  const getClassName = (code) => {
    // Safety check: if we have a translation object, get the name property
    const classInfo = t(`classes.${code}`, { returnObjects: true });
    
    // If classInfo is a string, use it directly
    if (typeof classInfo === 'string') return classInfo;
    
    // If classInfo is an object with name property, use name.en
    if (classInfo && typeof classInfo === 'object' && classInfo.name) {
      return typeof classInfo.name === 'object' ? 
        (classInfo.name.en || code) : 
        classInfo.name;
    }
    
    // Fallback to code
    return code;
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeStyles(classCode)}`}>
      {getClassName(classCode)}
    </span>
  );
};

export default ClassBadge;