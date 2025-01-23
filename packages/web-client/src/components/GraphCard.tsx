import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface ServerResponse {
  call_count: CallEntry[];
  total_duration_minutes: DurationEntry[];
}

interface CallEntry {
  event_date: string;
  call_count: number;
}

interface DurationEntry {
  event_date: string;
  total_duration_minutes: number;
}

interface GraphCardProps {
  title: string;
  data: (CallEntry | DurationEntry)[];
  dataKey: "call_count" | "total_duration_minutes";
  color: string;
  graphDays: number;
}

const GraphCard: React.FC<GraphCardProps> = ({
  title,
  data,
  dataKey,
  color,
  graphDays,
}) => {
  // Filter and sort the data based on graphDays
  const filteredData = data
    .slice(-graphDays)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const chartData = {
    labels: filteredData.map(
      (entry) =>
        `${new Date(entry.event_date).getDate().toString()} ${new Date(entry.event_date).toLocaleString("default", { month: "short" })}`
    ),
    datasets: [
      {
        data: filteredData.map((entry) => {
          if (dataKey === "call_count") {
            return "call_count" in entry ? entry.call_count : 0;
          } else {
            return "total_duration_minutes" in entry
              ? entry.total_duration_minutes
              : 0;
          }
        }),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        pointRadius: 2,
        tension: 0,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          color: "#69696f",
        },
        grid: { display: false },
        ticks: { 
          display: true, 
          color: "#69696f",
          maxTicksLimit: graphDays, // Limit the number of ticks based on graphDays
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          color: "white",
        },
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
        ticks: { display: true, color: "#69696f" },
      },
    },
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <Card className="w-4/12 h-96 dark:bg-otherBlue text-white">
      <CardHeader className="h-8 flex items-start mb-8">
        <CardTitle className="text-base text-center">{title}</CardTitle>
      </CardHeader>
      <div className="h-72 w-full p-2">
        <Line data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default GraphCard;