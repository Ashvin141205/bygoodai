import React from 'react';

const HeroBox = ({ children, title }) => {
  return (
    <div
      className="w-[300px] max-h-[350px] sm:w-[500px] relative hero-box-shadow [transform:translateZ(0)]"
      style={{ zIndex: 1 }} // Added zIndex to the parent
    >
      <div
        className="bg-black text-[#FFDD15] sm:text-2xl px-6 py-2 rounded-2xl text-center absolute w-full !top-0 z-30 font-semibold text-[13px]"
        style={{ transform: 'translateZ(0)' }} // Added transform to the title
      >
        {title}
      </div>
      <div className="h-full">{children}</div>
    </div>
  );
};

export default HeroBox;