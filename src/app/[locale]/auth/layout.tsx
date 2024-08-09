import LanguageSwitcher from "@/components/language-switcher";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const messages = await getMessages();
  return (
    <div className="h-full flex items-center justify-center container">
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </div>
  );
};

export default AuthLayout;
