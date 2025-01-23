"use client";
import { useLeadsGetLeads } from "@/api/leads/leads";
import { Lead, LeadStatus, Profile } from "@/api/schemas";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDateString } from "./Funnel";
import SidebarDetails from "./SidebarDetails";
import SidebarTable from "./SidebarTable";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SuspectSidebarProps {
  onSelectLead: ({ name, id }: { name: string; id: string }) => void;
}

export interface Suspect {
  id: string;
  name: string;
  status: LeadStatus;
  meetingDate: string;
  known: string;
  createdAt: string;
  state: string;
  agent: string;
}

interface Prospect {
  id: string;
  name: string;
  status: LeadStatus;
  meetingDate: string;
  known: string;
  createdAt: string;
  state: string;
  agent: string;
}

const SuspectSidebar: React.FC<SuspectSidebarProps> = ({ onSelectLead }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [susselected, sussetSelected] = useState<"suspects" | "prospects">(
    "suspects"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectSuspect = (suspect: Suspect) => {
    setSelectedSuspect(suspect);
    setShowDetails(true);
    onSelectLead({ name: suspect.name, id: suspect.id });
  };

  const handleGoBack = () => {
    setShowDetails(false);
    setSelectedSuspect(null);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  let id = "";
  if (typeof window !== "undefined") {
    id = localStorage.getItem("branchID") ?? "";
  }

  const {
    data: leads,
    isLoading,
    isError,
  } = useLeadsGetLeads({
    branch_id: id,
  });

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
          status: lead.status ?? "Yet to Contact",
          meetingDate: formatDateString(lead.meeting_date as string) || "",
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
          status: lead.status ?? "Yet to Contact",
          meetingDate: formatDateString(lead.meeting_date as string) || "",
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
    { key: "createdAt", label: "Created at", show: true },
    { key: "profile", label: "", show: true },
  ];

  const filteredSuspects = suspects.filter((suspect) =>
    suspect.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProspects = prospects.filter((prospect) =>
    prospect.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="border-l border-borderBlue md:block max-w-[300px] h-full">
      <div className="flex h-full flex-col gap-2 dark:bg-otherBlue">
        <div className="h-full overflow-y-auto">
          {showDetails ? (
            <SidebarDetails
              onBack={handleGoBack}
              selectedSuspect={selectedSuspect?.id as string}
            />
          ) : (
            <>
              <div className="flex items-center rounded shadow-sm bg-buttonGray px-1 py-1 my-2.5 mx-5">
                <Button
                  variant={susselected === "suspects" ? "default" : "ghost"}
                  onClick={() => sussetSelected("suspects")}
                  className={cn(
                    susselected === "suspects"
                      ? "text-white text-base dark:text-white dark:bg-buttonBlue hover:bg-slate-800"
                      : "text-base text-slate-500 hover:text-slate-900",
                    "rounded px-6"
                  )}
                >
                  SUSPECTS
                </Button>
                <Button
                  variant={susselected === "prospects" ? "default" : "ghost"}
                  onClick={() => sussetSelected("prospects")}
                  className={cn(
                    susselected === "prospects"
                      ? "text-white text-base dark:text-white dark:bg-buttonBlue hover:bg-slate-800"
                      : "text-base text-slate-500 hover:text-slate-900",
                    "rounded ml-1 px-4"
                  )}
                >
                  PROSPECTS
                </Button>
              </div>
              <div className="relative flex mt-4 mx-5">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  className="w-[100px] pl-10 bg-white shadow-none md:w-80 lg:w-[200px] h-9 dark:bg-otherBlue dark:text-white mr-5"
                  placeholder="Search here..."
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
              </div>
              {susselected === "suspects" ? (
                <SidebarTable
                  products={filteredSuspects}
                  onSelectSuspect={handleSelectSuspect}
                  columns={columns}
                />
              ) : (
                <SidebarTable
                  products={filteredProspects}
                  onSelectSuspect={handleSelectSuspect}
                  columns={columns}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuspectSidebar;
