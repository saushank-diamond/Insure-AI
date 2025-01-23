"use client";
import {
  useAuthenticationGetMe,
  useAuthenticationLogin,
} from "@/api/authentication/authentication";
import { User } from "@/api/schemas/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { AxiosError } from "axios";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import Logo from "./ui/logo";
import { useToast } from "./ui/use-toast";

interface FormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { mutateAsync: login, error } = useAuthenticationLogin();
  const { refetch: getMe } = useAuthenticationGetMe<User>({
    query: { enabled: false },
  });

  const handleLogin = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const result = await login({ data: values });
      localStorage.setItem("accessToken", result.access_token);

      // Fetch the latest user data
      const user = await getMe();
      const branchID = user?.data?.current_branch_id;
      if (branchID) {
        localStorage.setItem("branchID", branchID);
      }

      // Redirect to dashboard on successful login
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.error?.message
          : "An error occurred";
      toast({
        title: "Login Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <main className="dark bg-bgBlue min-h-screen flex items-center justify-center">
      <Toaster />
      <Card className="w-full max-w-sm dark:bg-otherBlue p-4">
        <CardHeader className="flex items-center mt-2">
          <Logo />
        </CardHeader>
        <CardContent className="mt-4">
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form className="grid gap-4">
                <Field name="email">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
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
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginForm;
