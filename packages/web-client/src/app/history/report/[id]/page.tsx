"use client";
import { useCallsGetCallReport } from "@/api/calls/calls";
import Meter from "@/components/Meter";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BackIcon, DownIcon, SaveIcon } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";

interface CallReport {
  overall_call_metrics: {
    confidence: string;
    energy_level: string;
    performance: string;
    professionalism: string;
    clarity: string;
  };
  call_feedback: {
    positives: string[];
    improvements: string[];
    general_comments: string[];
  };
}

const downloadReport = async (id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/calls/${id}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Report = () => {
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const {
    data: report,
    isLoading,
    isError,
  } = useCallsGetCallReport<{ report: CallReport; analytics: any }>(
    id as string
  );
  const reportData = report?.report;
  const analyticsData = report?.analytics.analytics_label;
  const overalCallMetrics = reportData?.overall_call_metrics;

  const [isDownloading, setIsDownloading] = useState(false);
  const [selected, setSelected] = useState("report");

  const handleDownloadReport = useCallback(() => {
    if (!isDownloading) {
      setIsDownloading(true);
      downloadReport(id as string);
      setIsDownloading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-white">
        Error loading report. Try again later.
      </div>
    );
  }

  return (
    <>
      <main className="dark max-w-full">
        <div className="flex flex-col dark:bg-bgBlue relative max-w-full">
          <div className="flex flex-row justify-between ml-5 mt-2">
            <div className="flex flex-row items-center">
              <Link href="/history">
                <button className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle mt-4 mr-2">
                  <BackIcon />
                </button>
              </Link>
              <div className="flex items-center rounded shadow-sm bg-buttonGray px-1 py-1 mt-2">
                <Button
                  variant={selected === "report" ? "default" : "ghost"}
                  onClick={() => setSelected("report")}
                  className={cn(
                    selected === "report"
                      ? "text-white text-base dark:text-white dark:bg-buttonBlue hover:bg-slate-800"
                      : "text-base text-slate-500 hover:text-slate-900",
                    "rounded px-8"
                  )}
                >
                  Call Report
                </Button>
                <Button
                  variant={selected === "video" ? "default" : "ghost"}
                  onClick={() => setSelected("video")}
                  className={cn(
                    selected === "video"
                      ? "text-white text-base dark:text-white dark:bg-buttonBlue hover:bg-slate-800"
                      : "text-base text-slate-500 hover:text-slate-900",
                    "rounded px-8"
                  )}
                >
                  Video Analytics
                </Button>
                <Button
                  variant={selected === "audio" ? "default" : "ghost"}
                  onClick={() => setSelected("audio")}
                  className={cn(
                    selected === "audio"
                      ? "text-white text-base dark:text-white dark:bg-buttonBlue hover:bg-slate-800"
                      : "text-base text-slate-500 hover:text-slate-900",
                    "rounded px-8"
                  )}
                >
                  Audio Analytics
                </Button>
              </div>
            </div>
            <div className="flex relative items-center mr-56 mt-3">
              <button
                className="rounded-full bg-gray-200 dark:bg-bgBlue"
                onClick={handleDownloadReport}
              >
                <SaveIcon />
              </button>
            </div>
          </div>
          <div className="mt-2 mr-60">
            <Separator className="dark:bg-borderBlue ml-5 mr-24" />{" "}
          </div>
          <div>
            {(selected === "report" && (
              <>
                {!reportData?.call_feedback ||
                !reportData?.overall_call_metrics ? (
                  <p className="text-white ml-5 mt-5">
                    Call Report is not ready yet! Check back later.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ml-5 mt-4 max-w-screen-2xl">
                      <Meter
                        title="Overall Call Performance"
                        rating={overalCallMetrics?.performance || ""}
                      />
                      <Meter
                        title="Professionalism"
                        rating={overalCallMetrics?.professionalism || ""}
                      />
                      <Meter
                        title="Confidence"
                        rating={overalCallMetrics?.confidence || ""}
                      />
                      <Meter
                        title="Energy Level"
                        rating={overalCallMetrics?.energy_level || ""}
                      />
                      <Meter
                        title="Clarity"
                        rating={overalCallMetrics?.clarity || ""}
                      />
                    </div>
                    <div className="mt-8 ml-5 flex flex-col gap-8 mr-10">
                      <>
                        {[
                          "What went well",
                          "What could have been better",
                          "General comments",
                        ].map((title, index) => (
                          <Collapsible
                            key={index}
                            className="w-full overflow-y-auto h-container"
                          >
                            <CollapsibleTrigger className="rounded-sm dark:bg-otherBlue border dark:border-borderBlue dark:text-label flex justify-between items-center px-2 py-2">
                              <span className="text-white">{title}</span>
                              <DownIcon />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-0">
                              <Card className="rounded-sm dark:bg-otherBlue border dark:border-borderBlue dark:text-label">
                                <CardHeader className="px-0 flex justify-center py-1"></CardHeader>
                                <CardContent className="p-0">
                                  {reportData?.call_feedback &&
                                    Object.values(reportData?.call_feedback)[
                                      index
                                    ].map((feedback, index) => (
                                      <div
                                        key={index}
                                        className="px-2 m-2 ml-2"
                                      >
                                        <span className="dark:text-md">
                                          - {feedback}
                                        </span>
                                      </div>
                                    ))}
                                </CardContent>
                              </Card>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </>
                    </div>
                  </>
                )}
              </>
            )) ||
              (selected === "video" && (
                <>
                  {!analyticsData || !analyticsData?.video_analytics ? (
                    <p className="text-white ml-5 mt-5">
                      Call video analytics is not ready yet! Check back later.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ml-5 mt-4 max-w-screen-2xl">
                      <Meter
                        title={`Attention: ${analyticsData?.video_analytics?.attention || ""}`}
                        rating={analyticsData?.video_analytics?.attention || ""}
                      />
                      <Meter
                        title={`Confidence: ${analyticsData?.video_analytics?.confidence || ""}`}
                        rating={
                          analyticsData?.video_analytics?.confidence || ""
                        }
                      />
                      <Meter
                        title={`Engagement: ${analyticsData?.video_analytics?.engagement || ""}`}
                        rating={analyticsData?.video_analytics.engagement || ""}
                      />
                      <Meter
                        title={`Expressiveness: ${analyticsData?.video_analytics?.expressiveness || ""}`}
                        rating={
                          analyticsData?.video_analytics.expressiveness || ""
                        }
                      />
                      <Meter
                        title={`Negative Emotions: ${analyticsData?.video_analytics?.negative_emotions || ""}`}
                        rating={
                          analyticsData?.video_analytics.negative_emotions || ""
                        }
                      />
                      <Meter
                        title={`Negative Facial Expressions: ${analyticsData?.video_analytics?.negative_facial_expressions || ""}`}
                        rating={
                          analyticsData?.video_analytics
                            .negative_facial_expressions || ""
                        }
                      />
                      <Meter
                        title={`Positive Emotions: ${analyticsData?.video_analytics?.positive_emotions || ""}`}
                        rating={
                          analyticsData?.video_analytics.positive_emotions || ""
                        }
                      />
                      <Meter
                        title={`Positive Facial Expressions: ${analyticsData?.video_analytics?.positive_facial_expressions || ""}`}
                        rating={
                          analyticsData?.video_analytics
                            .positive_facial_expressions || ""
                        }
                      />
                    </div>
                  )}
                </>
              )) ||
              (selected === "audio" && (
                <>
                  {!analyticsData || !analyticsData?.audio_analytics ? (
                    <p className="text-white ml-5 mt-5">
                      Call audio analytics is not ready yet! Check back later.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ml-5 mt-4 max-w-screen-2xl">
                      <Meter
                        title={`Articulation Rate: ${analyticsData?.audio_analytics?.articulation_rate || ""}`}
                        rating={
                          analyticsData?.audio_analytics?.articulation_rate ||
                          ""
                        }
                      />
                      <Meter
                        title={`Communication: ${analyticsData?.audio_analytics?.communication || ""}`}
                        rating={
                          analyticsData?.audio_analytics?.communication || ""
                        }
                      />
                      <Meter
                        title={`Number of Pauses: ${analyticsData?.audio_analytics?.number_of_pauses || ""}`}
                        rating={
                          analyticsData?.audio_analytics.number_of_pauses || ""
                        }
                      />
                      <Meter
                        title={`Rate of Speech: ${analyticsData?.audio_analytics?.rate_of_speech || ""}`}
                        rating={
                          analyticsData?.audio_analytics.rate_of_speech || ""
                        }
                      />
                      <Meter
                        title={`Response Latency: ${analyticsData?.audio_analytics?.response_latency || ""}`}
                        rating={
                          analyticsData?.audio_analytics.response_latency || ""
                        }
                      />
                    </div>
                  )}
                </>
              ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Report;
