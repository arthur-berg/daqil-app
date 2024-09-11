import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

export default AuthLayout;
