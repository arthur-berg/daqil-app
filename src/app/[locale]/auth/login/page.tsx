import { LoginForm } from "@/components/auth/login-form";

const LoginPage = ({ params }: { params: { locale: string } }) => {
  return (
    <div className="h-full flex items-center justify-center container">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
