import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import MainLayoutWrapper from "@/components/main-layout-wrapper";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const messages = await getMessages();
  return (
    <SessionProvider session={session}>
      <NextIntlClientProvider messages={messages}>
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
