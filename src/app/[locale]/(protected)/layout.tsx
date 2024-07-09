import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

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
        <Navbar />
      </NextIntlClientProvider>
      <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center container">
        {children}
      </div>
    </SessionProvider>
  );
}
