import { useLeadsGetLead } from "@/api/leads/leads";
import { Lead, LeadStatus, Profile } from "@/api/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDateString } from "./Funnel";
import { BackIcon, EditIcon } from "./ui/icons";
import { Status } from "./ui/status";

interface SidebarDetailsProps {
  onBack?: () => void;
  selectedSuspect: string;
}

interface returnType {
  lead: Lead;
  profile: Profile;
}

interface Suspect {
  id: string;
  name: string;
  status: LeadStatus;
  meetingDate: string;
  agent: string;
  known: string;
  createdAt: string;
  profile: string;
  phone: string;
  email: string;
  address: string;
  age: string;
  occupation: string;
  gender: string;
  income: string;
}

const SidebarDetails: React.FC<SidebarDetailsProps> = ({
  onBack,
  selectedSuspect,
}) => {
  const {
    data: leads,
    isLoading,
    isError,
  } = useLeadsGetLead(selectedSuspect as string);
  const leadss = leads as returnType;
  const profile = leadss?.profile;
  const lead = leadss?.lead;
  const details: Suspect[] = [
    {
      id: lead?.id,
      name: profile?.full_name ?? "",
      status: lead?.status ?? "Yet to Contact",
      meetingDate: lead?.meeting_date
        ? formatDateString(lead?.meeting_date as string)
        : "Not Scheduled",
      agent: lead?.associated_agent ?? "",
      known: lead?.known_to_agent ?? "",
      createdAt: formatDateString(lead?.created_at as string) ?? "",
      profile: profile?.object ?? "",
      phone: profile?.contact_number ?? "",
      email: profile?.email ?? "",
      address: profile?.physical_address ?? "",
      age: profile?.age ?? "",
      occupation: profile?.occupation ?? "",
      gender: profile?.gender ?? "",
      income: profile?.income_range ?? "",
    },
  ];

  return (
    <div className="hidden border-l border-borderBlue bg-gray-100/40 md:block h-screen">
      <div className="flex flex-col gap-2 dark:bg-otherBlue h-screen">
        <div className="flex-1">
          <div className="relative flex justify-between mt-2 mx-5">
            <button
              className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle"
              onClick={onBack}
            >
              <BackIcon />
            </button>

            <Link href={`/funnel/suspect/${selectedSuspect}`}>
              <button className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle">
                <EditIcon />
              </button>
            </Link>
          </div>
          {details.map((suspect: Suspect, idx) => (
            <Card
              className="overflow-hidden dark dark:bg-otherBlue dark:border dark:border-otherBlue"
              key={idx}
            >
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="flex items-start">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover mr-4"
                    height="80"
                    src="/Avatar.png"
                    width="80"
                  />
                  <div className="flex flex-col justify-between mt-1">
                    <CardTitle className="group flex items-center gap-2 text-base">
                      {suspect.name}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy Order ID</span>
                      </Button>
                    </CardTitle>
                    <CardDescription className="text-left">
                      ID: {suspect.id}
                    </CardDescription>
                    <Status
                      className="text-xs whitespace-nowrap pl-1"
                      variant={
                        suspect.status === "Yet to Contact"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {suspect.status}
                    </Status>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">Meeting Details</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span>{suspect.createdAt}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Agent</span>
                      <span>{suspect.agent}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Known to Agent?
                      </span>
                      <span>{suspect.known}</span>
                    </li>
                  </ul>
                  <Separator className="my-2 dark:bg-borderBlue" />
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span>{suspect.phone}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mail</span>
                      <span>{suspect.email}</span>
                    </li>
                  </ul>
                </div>
                <Separator className="my-4 dark:bg-borderBlue" />
                <div className="grid grid-cols-1">
                  <div className="grid">
                    <div className="font-semibold">Address</div>
                    <address className="grid gap-0.5 not-italic text-muted-foreground mt-2">
                      <span>{suspect.address}</span>
                    </address>
                  </div>
                </div>
                <Separator className="my-4 dark:bg-borderBlue" />
                <div className="grid gap-3">
                  <div className="font-semibold">More Details</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Age</dt>
                      <dd>{suspect.age}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Occupation</dt>
                      <dd>{suspect.occupation}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Gender</dt>
                      <dd>{suspect.gender}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Income</dt>
                      <dd>{suspect.income}</dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarDetails;
