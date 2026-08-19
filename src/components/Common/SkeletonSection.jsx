import React from 'react';

const SkeletonSection = ({ heightClass = 'h-48', className = '' }) => {
  return (
    <div className={`container mx-auto px-4 my-8 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-lg bg-gray-800/60 ${heightClass}`}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="absolute inset-0 animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-gray-700/50 via-gray-600/60 to-gray-700/50"></div>
        </div>
        <div className="absolute inset-0">
          <div className="p-6">
            <div className="h-8 w-1/3 bg-gray-700/70 rounded mb-4"></div>
            <div className="h-5 w-2/3 bg-gray-700/60 rounded mb-2"></div>
            <div className="h-5 w-1/2 bg-gray-700/60 rounded mb-2"></div>
            <div className="h-5 w-3/4 bg-gray-700/60 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonSection;
