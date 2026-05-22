import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center w-full bg-white px-8 md:w-1/2 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">X</div>
            <span className="font-bold text-gray-800 text-sm">Campus Lost&Found</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-400 text-sm mt-1 mb-8">{subtitle}</p>
          
          {children}
        </div>
      </div>

      {/* Right Side: Design Placeholder */}
      <div className="hidden md:flex md:w-1/2 bg-[#E5E5E5] relative overflow-hidden items-center justify-center">
        {/* Ang malaking 'X' design sa Figma */}
        <div className="absolute inset-0 border-[1px] border-gray-400">
          <div className="absolute top-0 left-0 w-full h-full border-b border-gray-400 origin-top-left rotate-[35deg] scale-150"></div>
          <div className="absolute top-0 right-0 w-full h-full border-b border-gray-400 origin-top-right -rotate-[35deg] scale-150"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;