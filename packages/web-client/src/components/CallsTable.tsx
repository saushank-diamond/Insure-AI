import { CallResponse } from "@/api/schemas/callResponse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import React from "react";
import { formatDateString } from "./Funnel";
import { Card, CardContent } from "./ui/card";
import { ArrowRightIcon, StarIcon } from "./ui/icons";

interface CallsTableProps {
  calls: CallResponse[];
  columns: TableColumn[];
  onRowClick: (call: any) => void;
  searchQuery: string;
}

interface TableColumn {
  key: string;
  label: string;
  show?: boolean;
}

const CallsTable: React.FC<CallsTableProps> = ({
  calls,
  columns,
  onRowClick,
  searchQuery,
}) => {
  const filteredCalls = calls.filter(({ call, profile_snapshot }) => {
    const fullName =
      profile_snapshot?.data &&
      JSON.parse(JSON.parse(profile_snapshot.data).profile)?.full_name;
    const name = fullName ?? "No Name Available";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Card className="dark:bg-otherBlue">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b border-gray-200">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={
                    column.show === false ? "hidden md:table-cell" : ""
                  }
                >
                  {column.label === "Image" ? (
                    <span className="sr-only">Image</span>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalls.map(({ call, profile_snapshot }) => (
              <TableRow key={call.id} onClick={() => onRowClick(call)}>
                {columns.map((column) => (
                  <TableCell
                    key={`${call.id}-${column.key}`}
                    className={
                      column.show === false ? "hidden md:table-cell" : ""
                    }
                  >
                    {column.key === "name" ? (
                      <div className="flex flex-row items-start">
                        <Image
                          alt="Call image"
                          className="aspect-square rounded-md object-cover mr-4"
                          height="40"
                          src="/Avatar.png"
                          width="40"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {(profile_snapshot?.data &&
                              JSON.parse(
                                JSON.parse(profile_snapshot.data).profile
                              )?.full_name) ??
                              "No Name Available"}{" "}
                          </span>
                          <span className="font-medium">
                            ID: {call.lead_id}
                          </span>
                        </div>
                      </div>
                    ) : column.key === "caller" ? (
                      call?.caller_name
                    ) : column.key === "meetingDate" ? (
                      call?.created_at ? (
                        formatDateString(call.created_at as string)
                      ) : (
                        "Not Available"
                      )
                    ) : column.key === "duration" ? (
                      call?.call_metadata !== null ? (
                        JSON.parse(call?.call_metadata as string).duration
                      ) : (
                        "Not Available"
                      )
                    ) : column.key === "performance" ? (
                      <div className="flex flex-row">
                        {(() => {
                          const performance =
                            call?.report &&
                            JSON.parse(call?.report as string)
                              .overall_call_metrics.performance;
                          if (performance === "bad") {
                            return (
                              <>
                                1
                                <StarIcon />
                              </>
                            );
                          } else if (performance === "average") {
                            return (
                              <>
                                2
                                <StarIcon />
                              </>
                            );
                          } else if (performance === "good") {
                            return (
                              <>
                                3
                                <StarIcon />
                              </>
                            );
                          } else if (performance === "excellent") {
                            return (
                              <>
                                4
                                <StarIcon />
                              </>
                            );
                          } else {
                            return "No Rating Available";
                          }
                        })()}
                      </div>
                    ) : column.key === "profile" ? (
                      <button
                        className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle"
                        onClick={() => onRowClick(call)}
                      >
                        <ArrowRightIcon />
                      </button>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CallsTable;
