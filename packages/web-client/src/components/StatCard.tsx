"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  trend: number;
  trendPrevious: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendPrevious,
}) => {
  const trendColor = trend >= 0 ? "dark:text-green-500" : "dark:text-red-500";
  const trendArrow = trend >= 0 ? "▲" : "▼";
  const trendPercentage = Math.abs(trend).toFixed(1);

  return (
    <Card className="w-64 h-56 dark:bg-otherBlue text-white">
      <CardHeader className="h-8 flex items-start mb-8">
        <CardTitle className="text-base text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-32">
        <div className="h-16 flex items-center justify-start text-4xl font-bold">
          {value}
        </div>
        <CardDescription
          className={`h-8 flex items-center justify-start font-medium ${trendColor}`}
        >
          {trendArrow}
          {trendPercentage}%
          <span className="ml-1 text-gray-400">
            previous {trendPrevious} days
          </span>
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default StatCard;
