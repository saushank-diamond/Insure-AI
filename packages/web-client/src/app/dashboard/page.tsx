"use client";
import {
  useMetricsGetCallMetricsTrends,
  useMetricsGetFunnelMetricsTrends,
  useMetricsGetMetrics,
  useMetricsGetMetricsGraph,
} from "@/api/metrics/metrics";
import { DatePickerWithPresets } from "@/components/DatePicker";
import FunnelChartComponent from "@/components/FunnelChart";
import GraphCard from "@/components/GraphCard";
import StatCard from "@/components/StatCard";
import StatDurationCard from "@/components/StatDurationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

interface FunnelData {
  index: number;
  value: number;
  label: string;
  percentage?: number;
  formattedPercentage?: string;
  trend: number;
}

interface MetricsResponse {
  0: {
    lead_created_suspect: number;
    lead_status_yet_to_contact: number;
    lead_status_contacted_dropped: number;
    first_meeting_scheduled: number;
    first_meeting_completed: number;
    second_meeting_scheduled: number;
    call_closed: number;
  };
  1: {
    event_count_call_started: number;
    event_count_appointment_call: number;
    event_count_meeting_call: number;
    duration_sum: number | null;
  };
}

interface FunnelTrends {
  funnel_trends: {
    lead_created_suspect: number;
    lead_status_yet_to_contact: number;
    lead_status_contacted_dropped: number;
    first_meeting_scheduled: number;
    first_meeting_completed: number;
    second_meeting_scheduled: number;
    call_closed: number;
  };
}

interface CallTrends {
  event_count_call_started: number;
  event_count_appointment_call: number;
  event_count_meeting_call: number;
  duration_sum: number;
}

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

const calculatePercentages = (data: FunnelData[]): FunnelData[] => {
  const total = data[0].value;
  return data.map((item) => ({
    ...item,
    percentage: Number((item.value / total) * 100).toFixed(
      1
    ) as unknown as number,
    formattedPercentage: `${Number((item.value / total) * 100).toFixed(1)}%`,
  }));
};

const formatDate = (date: Date): string => {
  const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss.SSSSSSXXX");
  return formattedDate;
};

function Dashboard() {
  const [tabValue, setTabValue] = useState<string>("number");
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), -7));
  const [startDate, setStartDate] = useState<string>(formatDate(addDays(new Date(), -7)));
  const [endDate, setEndDate] = useState<string>(formatDate(new Date()));

  let branchID = "";
  if (typeof window !== "undefined") {
    branchID = localStorage.getItem("branchID") ?? "";
  }

  const [metrics, setMetrics] = useState(null);
  const [graphMetrics, setGraphMetrics] = useState<ServerResponse>();

  const {
    data: metricsData,
    isLoading,
    isError,
    refetch,
  } = useMetricsGetMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      branch_id: branchID,
    },
    { query: { enabled: false } }
  );

  const fetchMetrics = useCallback(async () => {
    let data = await refetch();
    setMetrics(data as any);
  }, [branchID, startDate, endDate, refetch]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const { data: graphMetricsData } = useMetricsGetMetricsGraph({
    start_date: startDate,
    end_date: endDate,
    branch_id: branchID,
    granularity: "day",
  });

  useEffect(() => {
    setGraphMetrics(graphMetricsData as ServerResponse);
  }, [graphMetricsData]);

  const { data: funnelTrendsData } = useMetricsGetFunnelMetricsTrends({
    start_date: startDate,
    end_date: endDate,
    branch_id: branchID,
  });

  const { data: callTrendsData } = useMetricsGetCallMetricsTrends({
    start_date: startDate,
    end_date: endDate,
    branch_id: branchID,
  });

  let funnelTrends: FunnelTrends;
  let callTrends;
  let funnelTrendsArray;

  if (funnelTrendsData) {
    funnelTrends = funnelTrendsData as FunnelTrends;
    funnelTrendsArray = Object.entries(funnelTrends)[0][1];
  }

  if (callTrendsData) {
    callTrends = callTrendsData as CallTrends;
  }

  let totalDuration;
  let totalCallCount;

  if (graphMetricsData) {
    const graphData = graphMetricsData as ServerResponse;

    totalDuration = graphData.total_duration_minutes;
    totalCallCount = graphData.call_count;
  }

  let leadMetrics;
  let callMetrics;

  if (metricsData) {
    const metricss = metricsData as MetricsResponse;

    // Accessing lead metrics
    leadMetrics = metricss[0];
    // Accessing call metrics
    callMetrics = metricss[1];
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStartDate(formatDate(date));
    setEndDate(formatDate(new Date()));
  };

  const data: FunnelData[] = [
    {
      index: 0,
      value: leadMetrics?.lead_created_suspect ?? 0,
      label: "No. of Suspects",
      trend: funnelTrendsArray?.lead_created_suspect ?? 0,
    },
    {
      index: 1,
      value: leadMetrics?.lead_status_yet_to_contact ?? 0,
      label: "Yet to Contact",
      trend: funnelTrendsArray?.lead_status_yet_to_contact ?? 0,
    },
    {
      index: 2,
      value: leadMetrics?.lead_status_contacted_dropped ?? 0,
      label: "Contacted & Dropped",
      trend: funnelTrendsArray?.lead_status_contacted_dropped ?? 0,
    },
    {
      index: 3,
      value: leadMetrics?.first_meeting_scheduled ?? 0,
      label: "1st Meeting Scheduled",
      trend: funnelTrendsArray?.first_meeting_scheduled ?? 0,
    },
    {
      index: 4,
      value: leadMetrics?.first_meeting_completed ?? 0,
      label: "1st Meeting Completed",
      trend: funnelTrendsArray?.first_meeting_completed ?? 0,
    },
    {
      index: 5,
      value: leadMetrics?.second_meeting_scheduled ?? 0,
      label: "2nd Meeting Scheduled",
      trend: funnelTrendsArray?.second_meeting_scheduled ?? 0,
    },
    {
      index: 6,
      value: leadMetrics?.call_closed ?? 0,
      label: "Call Closed",
      trend: funnelTrendsArray?.call_closed ?? 0,
    },
  ];

  const handleTabChange = (value: string) => {
    setTabValue(value);
  };

  const chartData: FunnelData[] =
    tabValue === "number"
      ? data.map((item) => ({
          ...item,
          value: item.value,
        }))
      : calculatePercentages(data).map((item) => ({
          ...item,
          value: parseFloat(item.formattedPercentage || "0"),
        }));
        
  const daysDifference = Math.ceil((new Date().getTime() - selectedDate.getTime()) / (1000 * 3600 * 24));

  return (
    <main className="dark">
      <div className="grid min-h-screen">
        <div className="flex flex-col dark:bg-bgBlue relative">
          <div className="flex flex-row items-center ml-5 mt-5">
            <span className="text-xl dark:text-white ml-2 mr-5 whitespace-nowrap">
              Funnel Data
            </span>
            <div className="mr-5">
              <DatePickerWithPresets onSelect={handleDateSelect} />
            </div>
            <div>
              <Tabs
                value={tabValue}
                onValueChange={handleTabChange}
                className="mr-3 dark:bg-bgBlue"
              >
                <TabsList>
                  <TabsTrigger value="number">123</TabsTrigger>
                  <TabsTrigger value="percentage">%</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div>
            <Card className="dark:bg-otherBlue ml-5 mt-5 mr-20">
              <CardHeader className="mb-5">
                <CardTitle className="text-xl">Sales Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <FunnelChartComponent
                  data={chartData}
                  isPercentage={tabValue === "percentage"}
                  trendPercentages={funnelTrendsArray ?? []}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-row items-center ml-5 mt-10 max-w-full">
            <span className="text-xl dark:text-white ml-2 mr-5">Trends</span>
            <span className="dark:text-white">Last {daysDifference} days</span>
          </div>
          <div className="flex space-x-4 ml-5 mt-5">
            <StatCard
              title="Total Calls"
              value={callMetrics?.event_count_call_started ?? 0}
              trend={callTrends?.event_count_call_started ?? 0}
              trendPrevious={daysDifference}
            />
            <StatCard
              title="Appointment Fixing Calls"
              value={callMetrics?.event_count_appointment_call ?? 0}
              trend={callTrends?.event_count_appointment_call ?? 0}
              trendPrevious={daysDifference}
            />
            <StatCard
              title="Meeting Calls"
              value={callMetrics?.event_count_meeting_call ?? 0}
              trend={callTrends?.event_count_meeting_call ?? 0}
              trendPrevious={daysDifference}
            />
            <StatDurationCard
              title="Total Duration"
              value={callMetrics?.duration_sum ?? 0}
              trend={callTrends?.duration_sum ?? 0}
              trendPrevious={daysDifference}
            />
          </div>
          <div className="flex space-x-4 ml-5 mt-5">
            <GraphCard
              title="Calls Stats by No. of Calls"
              data={totalCallCount ?? []}
              dataKey="call_count"
              color="#3B82F6"
              graphDays={daysDifference}
            />
            <GraphCard
              title="Calls Stats by Duration"
              data={totalDuration ?? []}
              dataKey="total_duration_minutes"
              color="#3B82F6"
              graphDays={daysDifference}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;