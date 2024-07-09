import { RegisterForm } from "@/components/auth/register-form";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const RegisterPage = async () => {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <RegisterForm />
    </NextIntlClientProvider>
  );
};

export default RegisterPage;
