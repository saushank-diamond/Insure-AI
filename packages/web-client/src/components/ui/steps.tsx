import React from "react";

interface StepsProps {
  steps: string[];
}

const Steps: React.FC<StepsProps> = ({ steps }) => {
  return (
    <div className="bg-gray-800 text-white flex items-center justify-center p-2 h-10">
      <ol className="list-decimal">
        {steps.map((step, index) => (
          <li key={index} className="mb-2">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Steps;
