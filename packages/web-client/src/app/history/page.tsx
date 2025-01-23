"use client";
import { useCallsGetCalls } from "@/api/calls/calls";
import { Call } from "@/api/schemas";
import { CallResponse } from "@/api/schemas/callResponse";
import CallsTable from "@/components/CallsTable";
import ChatSummary from "@/components/ChatSummary";
import SidebarDetails from "@/components/SidebarDetails";
import { SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

interface TableColumn {
  key: string;
  label: string;
  show?: boolean;
}

function History() {
  let branchID = "";
  if (typeof window !== "undefined") {
    branchID = localStorage.getItem("branchID") ?? "";
  }

  const { data: callsData } = useCallsGetCalls<CallResponse[]>({
    branch_id: branchID,
  });

  const [rowClicked, setRowClicked] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Call | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const columns: TableColumn[] = useMemo(
    () => [
      { key: "image", label: "Image" },
      { key: "name", label: "Name" },
      { key: "caller", label: "Called By" },
      { key: "meetingDate", label: "Practice Date", show: true },
      { key: "duration", label: "Duration", show: true },
      { key: "performance", label: "Performance", show: true },
      { key: "profile", label: "", show: true },
    ],
    []
  );

  const handleRowClick = (lead: any) => {
    setSelectedLead(lead);
    setRowClicked(true);
  };

  return (
    <>
      <main className="dark">
        <div className="grid min-h-screen">
          <div className="flex flex-col dark:bg-bgBlue relative">
            {!rowClicked ? (
              <>
                <div className="relative flex ml-5 mt-4">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    className="w-5xl pl-10 bg-white shadow-none md:w-80 lg:w-[365] h-9 dark:bg-otherBlue dark:text-white"
                    placeholder="Search here..."
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                </div>
                <div className="ml-5 mr-72 mt-5">
                  <CallsTable
                    calls={callsData ? callsData : []}
                    columns={columns}
                    onRowClick={handleRowClick}
                    searchQuery={searchQuery}
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-[1fr_300px] h-full">
                <div className="flex flex-row relative col-start-1 justify-center">
                  <ChatSummary
                    id={selectedLead?.id as string}
                    onBackButtonClick={() => setRowClicked(false)}
                  />
                </div>
                <div className="col-start-2">
                  <SidebarDetails
                    selectedSuspect={selectedLead?.lead_id as string}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default History;
