import React from 'react';

const Message = ({ children, variant = 'info' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className={`p-4 mb-4 rounded-md border ${getVariantClasses()}`}>
      {children}
    </div>
  );
};

export default Message;
