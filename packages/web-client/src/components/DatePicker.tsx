"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { SelectSingleEventHandler } from "react-day-picker";

interface DatePickerProps {
  onSelect: (date: Date) => void;
}

export function DatePickerWithPresets({ onSelect }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>();
  const [fromDate, setFromDate] = React.useState<Date>();
  const [toDate, setToDate] = React.useState<Date>();
  const [rangeText, setRangeText] = React.useState<string>("");

  const handleDateSelect: SelectSingleEventHandler = (day) => {
    onSelect(day ?? new Date());
    setDate(day);
    setFromDate(day);
    setToDate(new Date());
    const startDate = format(day ?? "", "PPP");
    const endDate = format(new Date(), "PPP");
    setRangeText(`${startDate} - ${endDate}`);
  };

  const handlePresetClick = (days: number) => {
    const newDate = addDays(new Date(), days);
    const endDate = new Date();
    setDate(newDate);
    setFromDate(newDate);
    setToDate(endDate);
    onSelect(newDate);

    let rangeLabel = "";
    switch (days) {
      case -1:
        rangeLabel = "Yesterday";
        break;
      case -7:
        rangeLabel = "Last 7 days";
        break;
      case -14:
        rangeLabel = "Last 14 days";
        break;
      case -30:
        rangeLabel = "Last 30 days";
        break;
      case -90:
        rangeLabel = "Last 90 days";
        break;
      default:
        rangeLabel = "Last 7 days";
        break;
    }
    const startDate = format(newDate, "PPP");
    const endDateFormatted = format(endDate, "PPP");
    const dateRange = `${startDate} - ${endDateFormatted}`;
    setRangeText(`${rangeLabel ? `${rangeLabel} - ` : ""}${dateRange}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[400px] justify-start text-left font-normal dark:bg-calBlue dark:text-white"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {rangeText ||
            (fromDate && toDate
              ? `${format(fromDate, "PPP")} - ${format(toDate, "PPP")}`
              : `${format(addDays(new Date(), -7), "PPP")} - ${format(new Date(), "PPP")}`)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-row space-x-6 p-2 dark:bg-calBlue">
        <div className="flex flex-col rounded-md p-2 text-left">
          <Button
            variant={"secondary"}
            onClick={() => handlePresetClick(-1)}
            className="dark:bg-transparent"
          >
            Yesterday
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handlePresetClick(-7)}
            className="dark:bg-transparent"
          >
            Last 7 days
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handlePresetClick(-14)}
            className="w-auto dark:bg-transparent"
          >
            Last 14 days
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handlePresetClick(-30)}
            className="w-auto dark:bg-transparent"
          >
            Last 30 days
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handlePresetClick(-90)}
            className="w-auto dark:bg-transparent"
          >
            Last 90 days
          </Button>
        </div>
        <div className="rounded-md">
          <Calendar
            mode="single"
            onSelect={handleDateSelect}
            fromDate={fromDate}
            toDate={toDate}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
