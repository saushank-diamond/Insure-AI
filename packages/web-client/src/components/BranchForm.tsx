"use client";
import { branchesCreateBranch } from "@/api/branches/branches";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

interface FormValues {
  name: string;
}

export interface branchDetails {
  created_at: string;
  deleted_at: string | null;
  id: string;
  name: string;
  object: string;
  organization_id: string;
  updated_at: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Branch name is required"),
});

const BranchForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleBranch = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const result: any = await branchesCreateBranch(values);
      queryClient.setQueryData(["branchDetails"], result);
      localStorage.setItem("branchID", result?.id);

      // Redirect to dashboard on successful branch creation
      router.push("/dashboard");
    } catch (error) {
      console.error("Branch Creation failed:", error);
    }
  };

  return (
    <main className="dark bg-bgBlue min-h-screen flex items-center justify-center">
      <Card className="mx-auto max-w-md dark:bg-otherBlue">
        <CardHeader>
          <CardTitle className="text-xl">Create Branch</CardTitle>
          <CardDescription>
            Create a branch for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              name: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleBranch}
          >
            {({ isSubmitting }) => (
              <Form className="grid gap-4">
                <Field name="name">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="name">Branch Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Refreshmint"
                        required
                        {...field}
                      />
                      {meta.touched && meta.error && (
                        <div className="text-red-500">{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Branch..." : "Create Branch"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </main>
  );
};

export default BranchForm;
