import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import MainLayoutWrapper from "@/components/main-layout-wrapper";
import connectToMongoDB from "@/lib/mongoose";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToMongoDB();

  const session = await auth();
  const messages = await getMessages();

  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <NextIntlClientProvider messages={messages}>
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
