import { useLeadsUpdateLead } from "@/api/leads/leads";
import { LeadStatus } from "@/api/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useToast } from "./ui/use-toast";

const StatusBar = () => {
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    status: "",
    agent: "",
    knownToAgent: "",
    meetingDate: "",
  });
  const { status, agent, knownToAgent, meetingDate } = formData;
  const { mutate: updateLead, isSuccess } = useLeadsUpdateLead();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Lead updated successfully",
        description: "You can check out the changes in the funnel tab.",
        duration: 4000,
      });
    }
  }, [isSuccess]);

  const handleChange = (name: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Create an empty object to store the fields to be updated
    const updatedFields: any = {};

    // Check each field and add it to the updatedFields object if it has a value
    if (status !== "") {
      updatedFields.status = status as LeadStatus;
    }
    if (agent !== "") {
      updatedFields.associated_agent = agent;
    }
    if (knownToAgent !== "") {
      updatedFields.known_to_agent = knownToAgent;
    }
    if (meetingDate !== "") {
      updatedFields.meeting_date = meetingDate;
    }

    // Update the lead with the fields provided by the user
    updateLead({
      leadId: id as string,
      data: { lead: updatedFields },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="ml-5 mr-56 mb-5 dark:bg-otherBlue">
        <CardHeader>
          <div className="grid grid-cols-4 gap-24 mr-18">
            <CardTitle className="text-base">Status</CardTitle>
            <CardTitle className="text-base">Agent Associated</CardTitle>
            <CardTitle className="text-base">Known to Agent?</CardTitle>
            <CardTitle className="text-base">Meeting Date</CardTitle>
          </div>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-24 mr-18">
            <Select
              name="status"
              value={status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="dark:bg-buttonGray dark">
                <SelectValue placeholder="Yet to Contact" />
              </SelectTrigger>
              <SelectContent className="">
                {Object.values(LeadStatus).map((status) => (
                  <SelectItem key={status} value={status} className="">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="agent"
              value={agent}
              onChange={(e) => handleChange("agent", e.target.value)}
              placeholder="Enter Agent"
              className="dark:bg-buttonGray"
            />
            <Select
              name="knownToAgent"
              value={knownToAgent}
              onValueChange={(value) => handleChange("knownToAgent", value)}
            >
              <SelectTrigger className="dark:bg-buttonGray">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Friends">Friends</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Referrals">Referrals</SelectItem>
                <SelectItem value="Recommendations">Recommendations</SelectItem>
                <SelectItem value="Cold Call">Cold Call</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="meetingDate"
              type="date"
              value={meetingDate}
              onChange={(e) => handleChange("meetingDate", e.target.value)}
              className="dark:bg-buttonGray items-center justify-center"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="py-2 px-6 dark:bg-buttonBlue dark:text-white"
          >
            Update Lead
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export interface Details {
  fullName: string;
  contactNumber: string;
  email: string;
  physicalAddress: string;
  city: string;
  state: string;
  zipcode: string;
  age: string;
  occupation: string;
  gender: string;
  incomeRange: string;
}

interface FormValuesProps {
  details: Details;
}

export const ViewSuspect: React.FC<FormValuesProps> = ({ details }) => {
  return (
    <>
      <StatusBar />
      <Card className="ml-5 mr-56 mt-3 mb-5 dark:bg-otherBlue">
        <CardHeader>
          <CardTitle className="font-normal text-base mb-2">
            Basic Details
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-11">
              <div>
                <label className="text-base font-normal text-label">
                  Full Name:
                </label>
                <Input
                  type="text"
                  value={details.fullName}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
              <div>
                <label className="text-base font-normal text-label">
                  Contact Number:
                </label>
                <Input
                  type="text"
                  value={details.contactNumber}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
              <div>
                <label className="text-base font-normal text-label">
                  Email:
                </label>
                <Input
                  type="text"
                  value={details.email}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
            </div>
            <div className="mr-20">
              <label className="text-base font-normal text-label">
                Physical Address:
              </label>
              <Input
                type="text"
                value={details.physicalAddress}
                disabled
                className="dark:bg-buttonGray"
              />
            </div>
            <div className="flex flex-row gap-11">
              <div>
                <label className="text-base font-normal text-label">
                  City:
                </label>
                <Input
                  type="text"
                  value={details.city}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
              <div>
                <label className="text-base font-normal text-label">
                  State:
                </label>
                <Input
                  type="text"
                  value={details.state}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
              <div>
                <label className="text-base font-normal text-label">
                  Zipcode:
                </label>
                <Input
                  type="text"
                  value={details.zipcode}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
            </div>
            <div className="flex flex-row gap-11">
              <div>
                <label className="text-base font-normal text-label">Age:</label>
                <Input
                  type="text"
                  value={details.age}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
              <div>
                <label className="text-base font-normal text-label">
                  Occupation:
                </label>
                <Input
                  type="text"
                  value={details.occupation}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
              <div>
                <label className="text-base font-normal text-label">
                  Gender:
                </label>
                <Input
                  type="text"
                  value={details.gender}
                  disabled
                  className="mr-60 dark:bg-buttonGray"
                />
              </div>
            </div>
            <div>
              <label className="text-base font-normal text-label">
                Income Range:
              </label>
              <Input
                type="text"
                value={details.incomeRange}
                disabled
                className="dark:bg-buttonGray w-96"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
