import RegisterForm from "@/components/RegisterForm";
import { Suspense } from "react";

const Register = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
};

export default Register;
