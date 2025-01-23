"use client";
import { useLeadsGetLeads } from "@/api/leads/leads";
import { Lead, Profile } from "@/api/schemas";
import ProductsTable from "@/components/Table";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export function formatDateString(dateString: string) {
  // Create a new Date object from the input string
  const dateObject = new Date(dateString);

  // Get the month, day, and year from the Date object
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[dateObject.getMonth()];
  const day = dateObject.getDate();
  const year = dateObject.getFullYear();
  const formattedTime = dateObject.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const formattedDate = `${month} ${day}, ${year} ${formattedTime}`;
  return formattedDate;
}

export default function Funnel() {
  const [selected, setSelected] = useState("suspects");
  const [searchQuery, setSearchQuery] = useState("");
  const id = localStorage.getItem("branchID") ?? "";

  const {
    data: leads,
    isLoading,
    isError,
  } = useLeadsGetLeads({
    branch_id: id,
  });

  interface Suspect {
    id: string;
    name: string;
    status: string;
    meetingDate: string;
    known: string;
    createdAt: string;
    state: string;
    agent: string;
  }

  interface Prospect {
    id: string;
    name: string;
    status: string;
    meetingDate: string;
    known: string;
    createdAt: string;
    state: string;
    agent: string;
  }

  const suspects: Suspect[] = [];
  const prospects: Prospect[] = [];

  if (Array.isArray(leads)) {
    leads.forEach((item: any) => {
      const lead: Lead = item.lead;
      const profile: Profile = item.profile;
      if (lead.type === "suspect") {
        const suspect: Suspect = {
          id: lead.id ?? "",
          name: profile.full_name ?? "",
          status: lead.status ?? "",
          meetingDate: lead.meeting_date
            ? formatDateString(lead.meeting_date as string)
            : "Not Scheduled",
          known: lead.known_to_agent ? "Yes" : "No",
          createdAt: formatDateString(lead.created_at as string) ?? "",
          state: profile.state ?? "",
          agent: lead.associated_agent ?? "",
        };
        suspects.push(suspect);
      } else if (lead.type === "prospect") {
        const prospect: Prospect = {
          id: lead.id ?? "",
          name: profile.full_name ?? "",
          status: lead.status ?? "",
          meetingDate: lead.meeting_date
            ? formatDateString(lead.meeting_date as string)
            : "Not Scheduled",
          known: lead.known_to_agent ? "Yes" : "No",
          createdAt: formatDateString(lead.created_at as string) ?? "",
          state: profile.state ?? "",
          agent: lead.associated_agent ?? "",
        };
        prospects.push(prospect);
      }
    });
  }

  const columns = [
    { key: "image", label: "Image" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", show: true },
    { key: "meetingDate", label: "Meeting Date", show: true },
    { key: "agent", label: "Agent", show: true },
    { key: "known", label: "Known to Agent?", show: true },
    { key: "created_at", label: "Created at", show: true },
    { key: "profile", label: "", show: true },
  ];

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <main className="dark">
        <div className="grid min-h-screen w-full">
          <div className="flex flex-col dark:bg-bgBlue">
            <div className="flex justify-between items-center ml-5 pt-5">
              <div className="flex items-center rounded shadow-sm bg-buttonGray px-1 py-1">
                <Button
                  variant={selected === "suspects" ? "default" : "ghost"}
                  onClick={() => setSelected("suspects")}
                  className={cn(
                    selected === "suspects"
                      ? "text-white text-base dark:text-white dark:bg-buttonBlue hover:bg-slate-800"
                      : "text-base text-slate-500 hover:text-slate-900",
                    "rounded px-8"
                  )}
                >
                  SUSPECTS
                </Button>
                <Button
                  variant={selected === "prospects" ? "default" : "ghost"}
                  onClick={() => setSelected("prospects")}
                  className={cn(
                    selected === "prospects"
                      ? "text-white text-base dark:text-white dark:bg-buttonBlue hover:bg-slate-800"
                      : "text-base text-slate-500 hover:text-slate-900",
                    "rounded px-8"
                  )}
                >
                  PROSPECTS
                </Button>
              </div>
            </div>
            <Separator className="mt-3 dark:bg-borderBlue" />
            <div className="relative flex ml-5 mt-4">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                className="w-5xl pl-10 bg-white shadow-none md:w-80 lg:w-[365] h-9 dark:bg-otherBlue dark:text-white"
                placeholder="Search here..."
                type="search"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <Link href={"/funnel/addlead"}>
                <Button
                  variant="default"
                  className="text-white text-base dark:text-white md:w-43 lg:w-43 h-9 dark:bg-buttonBlue hover:bg-slate-800 absolute right-24 px-10"
                >
                  {selected === "suspects" ? "ADD SUSPECT" : "ADD PROSPECT"}
                </Button>
              </Link>
            </div>
            <div className="ml-5 mr-24 mt-4">
              {selected === "suspects" ? (
                <ProductsTable
                  products={suspects}
                  columns={columns}
                  searchQuery={searchQuery}
                />
              ) : (
                <ProductsTable
                  products={prospects}
                  columns={columns}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
