import React from "react";

interface NumberIconProps {
  number: number;
  className?: string;
}

export const NumberIcon: React.FC<NumberIconProps> = ({
  number,
  className,
}) => {
  return (
    <div
      className={`rounded-full bg-gray-200 dark:bg-bgBlue text-gray-800 dark:text-gray-200 p-1 w-6 h-6 flex items-center justify-center text-xs font-medium ${className}`}
    >
      {number}
    </div>
  );
};
