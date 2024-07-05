import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";

import connectToMongoDB from "@/lib/mongoose";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Zakina app",
  description: "Zakina app",
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  try {
    await connectToMongoDB();
    console.log("Mongo connected");
  } catch {
    console.log("Mongo connection failed");
  }

  return (
    <html lang={locale}>
      <body className={dmSans.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
