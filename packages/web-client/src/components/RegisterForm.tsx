"use client";
import {
  useAuthenticationGetMe,
  useAuthenticationRegister,
} from "@/api/authentication/authentication";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import { Field, Form, Formik, FormikHelpers } from "formik";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { User } from "../api/schemas";
import Logo from "./ui/logo";
import { Toaster } from "./ui/toaster";
import { useToast } from "./ui/use-toast";

interface FormValues {
  full_name: string;
  email: string;
  password: string;
  organization_name: string;
}

const validationSchema = Yup.object().shape({
  full_name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  organization_name: Yup.string().required("Organization name is required"),
});

const RegisterForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutateAsync: register, error } = useAuthenticationRegister();
  const { refetch: getMe } = useAuthenticationGetMe<User>({
    query: { enabled: false },
  });

  const emailParam = searchParams.get("email");
  const organizationNameParam = searchParams.get("organization_name");
  const inviteToken = searchParams.get("invite_token");
  const nameParam = searchParams.get("name");

  const handleRegister = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const result = await register({
        data: { ...values, invite_token: inviteToken },
      });

      localStorage.setItem("accessToken", result.access_token);

      // Redirect to dashboard if coming from a registration link
      if (emailParam && inviteToken) {
        // Fetch the latest user data
        const user = await getMe();
        const branchID = user?.data?.current_branch_id;
        if (branchID) {
          localStorage.setItem("branchID", branchID);
        }
        router.push("/dashboard");
      } else {
        // Redirect to branch selection page
        router.push("/branch");
      }
    } catch (error) {
      // Handle registration error here
      console.error("Failed to Register:", error);
      const errorMessage =
        (error as AxiosError)?.response?.statusText || "An error occurred";
      toast({
        title: "Failed to Register",
        description: errorMessage,
      });
    }
  };

  return (
    <main className="dark bg-bgBlue min-h-screen flex items-center justify-center">
      <Toaster />
      <Card className="w-full max-w-sm mx-auto dark:bg-otherBlue p-4">
        <CardHeader className="flex items-center mt-2">
          <Logo />
        </CardHeader>
        <CardContent className="mt-4">
          <Formik
            initialValues={{
              full_name: nameParam || "",
              email: emailParam || "",
              password: "",
              organization_name: organizationNameParam || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form className="grid gap-4">
                <Field name="full_name">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">Full name</Label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        required
                        disabled={!!nameParam}
                        {...field}
                      />
                      {meta.touched && meta.error && (
                        <div className="text-red-500">{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>
                <Field name="email">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        disabled={!!emailParam}
                        {...field}
                      />
                      {meta.touched && meta.error && (
                        <div className="text-red-500">{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>
                <Field name="organization_name">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="organization_name">
                        Organization Name
                      </Label>
                      <Input
                        id="organization_name"
                        type="text"
                        placeholder="Refreshmint"
                        required
                        disabled={!!organizationNameParam}
                        {...field}
                      />
                      {meta.touched && meta.error && (
                        <div className="text-red-500">{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>
                <Field name="password">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
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
                  {isSubmitting ? "Creating Account..." : "Create an account"}
                </Button>
              </Form>
            )}
          </Formik>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default RegisterForm;
function getMe() {
  throw new Error("Function not implemented.");
}
