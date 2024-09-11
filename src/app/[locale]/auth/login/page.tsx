import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";
import RedirectCheck from "@/app/[locale]/auth/login/redirect-check";

const LoginPage = async () => {
  return (
    <div className="h-full flex items-center justify-center container">
      <Suspense>
        <RedirectCheck />
      </Suspense>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
