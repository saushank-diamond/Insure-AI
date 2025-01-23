import React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-white">real.ai</h1>
      <div className="flex items-center text-sm">
        <span className="mr-1 text-xs text-white">powered by</span>
        <img
          src="/refreshlogo.png"
          alt="Refreshmint Logo"
          width={60}
          height={60}
        />
      </div>
    </div>
  );
};

export default Logo;
