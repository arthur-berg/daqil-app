import { RegisterForm } from "@/components/auth/register-form";

const RegisterPage = ({
  searchParams,
}: {
  searchParams: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}) => {
  return (
    <div className="h-full flex items-center justify-center container">
      <RegisterForm searchParams={searchParams} />
    </div>
  );
};

export default RegisterPage;
