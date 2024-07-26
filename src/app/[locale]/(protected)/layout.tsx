import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Sidebar } from "@/components/sidebar/sidebar";
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
        {/* <Navbar /> */}
        {/*  <Sidebar /> */}

        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
