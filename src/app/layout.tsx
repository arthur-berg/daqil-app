import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import connectToMongoDB from "@/lib/mongoose";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Zakina app",
  description: "Zakina app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await connectToMongoDB();
    console.log("Mongo connected");
  } catch {
    console.log("Mongo connection failed");
  }

  return (
    <html lang="en">
      <body className={dmSans.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
