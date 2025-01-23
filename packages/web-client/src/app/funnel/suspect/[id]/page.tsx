"use client";
import { ViewSuspect } from "@/components/ViewSuspect";
import { Button } from "@/components/ui/button";
import { BackIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLeadsDeleteLead, useLeadsGetLead } from "@/api/leads/leads";
import { Lead, Profile } from "@/api/schemas";
import { Details } from "@/components/ViewSuspect";
import { useToast } from "@/components/ui/use-toast";

export interface returnType {
  lead: Lead;
  profile: Profile;
}

export default function Page() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const { data: leads, isLoading, isError } = useLeadsGetLead(id as string);
  const leadss = leads as returnType;
  const profile = leadss?.profile;
  const { mutate: deleteLead, isSuccess } = useLeadsDeleteLead();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Lead deleted successfully",
        description: "You can check out your other leads in the funnel tab.",
        duration: 4000,
      });
    }
  }, [isSuccess]);

  const leadDetails = leadss?.lead;
  const [isCallButtonDisabled, setIsCallButtonDisabled] = useState(true);

  // Effect to enable the "START CALLS" button when lead details are updated with the required fields
  useEffect(() => {
    // Check if all required fields are populated
    const areRequiredFieldsPopulated =
      leadDetails &&
      leadDetails.known_to_agent !== null &&
      leadDetails.associated_agent !== null;

    // Update the state for the button's enabled status
    setIsCallButtonDisabled(!areRequiredFieldsPopulated);
  }, [leadDetails]);

  const handleCallButtonClick = () => {
    router.push("/practice");
  };

  const details: Details = {
    fullName: profile?.full_name ?? "",
    contactNumber: profile?.contact_number ?? "",
    email: profile?.email ?? "",
    physicalAddress: profile?.physical_address ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    zipcode: profile?.zipcode ?? "",
    age: profile?.age ?? "",
    occupation: profile?.occupation ?? "",
    gender: profile?.gender ?? "",
    incomeRange: profile?.income_range ?? "",
  };

  return (
    <main className="dark">
      <div className="grid min-h-screen">
        <div className="flex flex-col dark:bg-bgBlue relative">
          <div className="flex flex-row items-center justify-between ml-5 mt-2 mb-5 max-w-full">
            <div className="flex flex-row items-center">
              <Link href="/funnel">
                <button className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle mt-4">
                  <BackIcon />
                </button>
              </Link>
              <span className="text-base dark:text-white ml-2 mt-5">
                Suspect Profile
              </span>
            </div>
            <div className="flex flex-row gap-2 relative items-center mr-56 mt-3">
              <button className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle">
                <PlusIcon />
              </button>
              <button
                className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle"
                onClick={() => deleteLead({ leadId: id as string })}
              >
                <TrashIcon />
              </button>
              <Button
                type="submit"
                className={`py-2 px-6 dark:bg-buttonBlue dark:text-white ${isCallButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleCallButtonClick}
                disabled={isCallButtonDisabled}
              >
                START CALLS
              </Button>
            </div>
          </div>
          {details && <ViewSuspect details={details} />}
        </div>
      </div>
    </main>
  );
}
