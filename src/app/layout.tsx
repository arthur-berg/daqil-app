import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

import connectToMongoDB from "@/lib/mongoose";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Zakina app",
  description: "Zakina app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  connectToMongoDB()
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error(error));

  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
