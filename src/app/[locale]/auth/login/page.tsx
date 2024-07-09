import { LoginForm } from "@/components/auth/login-form";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const LoginPage = async ({ params }: { params: { locale: string } }) => {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={params.locale}>
      <LoginForm />
    </NextIntlClientProvider>
  );
};

export default LoginPage;
