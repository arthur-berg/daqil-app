import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getLangDir } from "rtl-detect";
import connectToMongoDB from "@/lib/mongoose";
import { auth } from "@/auth";

import "@/app/globals.css";
import { SessionProvider } from "next-auth/react";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Zakina app",
  description: "Zakina app",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  await connectToMongoDB();

  const direction = getLangDir(locale);
  const session = await auth();

  return (
    <html lang={locale} dir={direction}>
      <body className={dmSans.className}>
        <Toaster />

        <SessionProvider
          session={session}
          refetchOnWindowFocus={false}
          refetchInterval={0}
        >
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
