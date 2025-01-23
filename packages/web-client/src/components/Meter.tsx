import React from "react";
import { AverageMeter, BadMeter, ExcMeter, GoodMeter } from "./ui/icons";

interface MeterProps {
  title: string;
  rating: string;
}

const Meter: React.FC<MeterProps> = ({ title, rating }) => {
  let meterComponent: JSX.Element;
  switch (rating) {
    case "bad":
    case "Poor":
      meterComponent = <BadMeter />;
      break;
    case "average":
    case "Low":
      meterComponent = <AverageMeter />;
      break;
    case "good":
    case "Good":
      meterComponent = <GoodMeter />;
      break;
    case "excellent":
      meterComponent = <ExcMeter />;
      break;
    default:
      meterComponent = <BadMeter />;
      break;
  }
  return (
    <div className="flex flex-col gap-4 items-center justify-center dark:bg-otherBlue dark:text-white w-[199px] h-[228px] mr-8 p-3">
      <span>{title}</span>
      {meterComponent}
    </div>
  );
};
export default Meter;
