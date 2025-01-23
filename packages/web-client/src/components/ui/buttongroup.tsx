import React, { useState } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
interface ButtonGroupProps {
  labels: string[];
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ labels }) => {
  const [selected, setSelected] = useState(labels[0]);

  return (
    <div className="flex rounded-md shadow-sm" role="group">
      {labels.map((label, index) => (
        <Button
          key={label}
          variant={selected === label ? "default" : "ghost"}
          onClick={() => setSelected(label)}
          className={cn(
            selected === label
              ? "text-white bg-slate-900 hover:bg-slate-800"
              : "text-slate-500 hover:text-slate-900",
            index === 0
              ? "rounded-l-md"
              : index === labels.length - 1
                ? "rounded-r-md"
                : ""
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

export default ButtonGroup;
