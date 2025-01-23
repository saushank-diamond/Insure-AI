"use client";
import { useLeadsCreateLead } from "@/api/leads/leads";
import { LeadType } from "@/api/schemas";
import { returnType } from "@/app/funnel/suspect/[id]/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { useToast } from "./ui/use-toast";
import { useCallback } from "react";

const formSchema = Yup.object({
  fullName: Yup.string().min(1).required("Name is required."),
  contactNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  leadType: Yup.string().required("Lead Type is required"),
  physicalAddress: Yup.string().min(1),
  city: Yup.string().min(1),
  state: Yup.string().min(1),
  zipcode: Yup.string().min(1),
  age: Yup.string().min(1),
  occupation: Yup.string().min(1),
  gender: Yup.string().min(1),
  incomeRange: Yup.string().min(1),
});

const AddSuspectForm: React.FC = () => {
  const { toast } = useToast();
  const createLeadMutation = useLeadsCreateLead();
  const router = useRouter();
  const id = localStorage.getItem("branchID") ?? "";

  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        const leadData = {
          branch_id: id,
          profile: {
            full_name: values.fullName,
            contact_number: values.contactNumber,
            email: values.email,
            physical_address: values.physicalAddress,
            city: values.city,
            state: values.state,
            zipcode: values.zipcode,
            age: values.age,
            occupation: values.occupation,
            gender: values.gender,
            income_range: values.incomeRange,
          },
          type: values.leadType as LeadType,
        };

        const result = await createLeadMutation.mutateAsync({ data: leadData });

        toast({
          title: "Lead created successfully",
          description:
            "You can check out the leads you've added in the funnel tab!",
        });

        const leadDetails = result as returnType;
        const leadId = leadDetails.lead.id as string;

        router.push(`/funnel/suspect/${leadId}`);
      } catch (error) {
        console.error("Error creating lead:", error);
        toast({
          title: "Error creating lead",
          description: "Please try again later.",
        });
      }
    },
    [id, createLeadMutation, toast, router]
  );

  return (
    <Card className="ml-5 mt-3 mb-5 dark:bg-otherBlue">
      <CardHeader>
        <CardTitle className="font-normal text-base mb-2">
          Basic Details
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            fullName: "",
            contactNumber: "",
            email: "",
            leadType: "",
            physicalAddress: "",
            city: "",
            state: "",
            zipcode: "",
            age: "",
            occupation: "",
            gender: "",
            incomeRange: "",
          }}
          validationSchema={formSchema}
          onSubmit={handleSubmit}
        >
          <Form className="max-w-full w-full flex flex-col">
            <div className="flex flex-row gap-10 mb-5">
              <div className="mb-5 mr-7">
                <label
                  htmlFor="fullName"
                  className="text-base font-normal text-label"
                >
                  Full Name
                </label>
                <Field
                  name="fullName"
                  id="fullName"
                  placeholder="Enter Full Name"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="fullName"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-5 mr-7">
                <label
                  htmlFor="contactNumber"
                  className="text-base font-normal text-label"
                >
                  Contact Number
                </label>
                <Field
                  name="contactNumber"
                  id="contactNumber"
                  placeholder="Enter Contact Number"
                  className="dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="contactNumber"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-5 mr-7">
                <label
                  htmlFor="email"
                  className="text-base font-normal text-label"
                >
                  Email
                </label>
                <Field
                  name="email"
                  id="email"
                  placeholder="Enter Email"
                  className="dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-5 mr-7">
                <label
                  htmlFor="leadType"
                  className="text-base font-normal text-label"
                >
                  Lead Type
                </label>
                <Field
                  as="select"
                  name="leadType"
                  id="leadType"
                  className="dark:bg-buttonGray p-2 rounded-md"
                >
                  <option value="" disabled className="text-cuteBlue">
                    Select Lead Type
                  </option>
                  <option value="suspect">Suspect</option>
                  <option value="prospect">Prospect</option>
                </Field>
                <ErrorMessage
                  name="leadType"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>
            <div className="flex flex-row gap-10 mb-5">
              <div className="mb-5 mr-11 w-full">
                <label
                  htmlFor="physicalAddress"
                  className="text-base font-normal text-label"
                >
                  Physical Address
                </label>
                <Field
                  name="physicalAddress"
                  id="physicalAddress"
                  placeholder="Enter Physical Address"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="physicalAddress"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>
            <div className="flex flex-row gap-10 mb-5">
              <div className="mb-5 mr-11">
                <label
                  htmlFor="city"
                  className="text-base font-normal text-label"
                >
                  City
                </label>
                <Field
                  name="city"
                  id="city"
                  placeholder="Enter City"
                  className="dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="city"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-5 mr-11">
                <label
                  htmlFor="state"
                  className="text-base font-normal text-label"
                >
                  State
                </label>
                <Field
                  name="state"
                  id="state"
                  placeholder="Enter State"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="state"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-5 mr-11">
                <label
                  htmlFor="zipcode"
                  className="text-base font-normal text-label"
                >
                  Zipcode
                </label>
                <Field
                  name="zipcode"
                  id="zipcode"
                  placeholder="Enter Zipcode"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="zipcode"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>
            <div className="flex flex-row gap-10 mb-5">
              <div className="mb-5 mr-11">
                <label
                  htmlFor="age"
                  className="text-base font-normal text-label"
                >
                  Age
                </label>
                <Field
                  name="age"
                  id="age"
                  placeholder="Enter Age"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="age"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-5 mr-11">
                <label
                  htmlFor="occupation"
                  className="text-base font-normal text-label"
                >
                  Occupation
                </label>
                <Field
                  name="occupation"
                  id="occupation"
                  placeholder="Enter Occupation"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="occupation"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="mb-5 mr-11">
                <label
                  htmlFor="gender"
                  className="text-base font-normal text-label"
                >
                  Gender
                </label>
                <Field
                  name="gender"
                  id="gender"
                  placeholder="Enter Gender"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="gender"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>
            <div className="flex flex-row gap-10 mb-5">
              <div className="mb-5 mr-11">
                <label
                  htmlFor="incomeRange"
                  className="text-base font-normal text-label"
                >
                  Income Range
                </label>
                <Field
                  name="incomeRange"
                  id="incomeRange"
                  placeholder="Enter Income Range"
                  className=" dark:bg-buttonGray"
                  as={Input}
                />
                <ErrorMessage
                  name="incomeRange"
                  component="div"
                  className="text-red-500"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="py-2 px-6 dark:bg-buttonBlue dark:text-white"
              disabled={createLeadMutation.isPending}
            >
              {createLeadMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </Form>
        </Formik>
      </CardContent>
    </Card>
  );
};

export default AddSuspectForm;
