import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getLangDir } from "rtl-detect";
import {
  scheduleJob,
  statusUpdateQueue,
  cancelUnpaidQueue,
} from "@/lib/bullmq";

import "@/app/globals.css";

import connectToMongoDB from "@/lib/mongoose";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Zakina app",
  description: "Zakina app",
};

const scheduleInitialJobs = async () => {
  console.log("Scheduling initial jobs...");

  // Schedule check and update appointment statuses job
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes later

  await scheduleJob(
    statusUpdateQueue,
    "updateAppointmentStatus",
    {},
    fiveMinutesFromNow.getTime() - now.getTime()
  );

  // Schedule cancel unpaid appointments job
  await scheduleJob(
    cancelUnpaidQueue,
    "cancelUnpaidAppointments",
    {},
    fiveMinutesFromNow.getTime() - now.getTime()
  );
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  try {
    await connectToMongoDB();
    console.log("Mongo connected and cron jobs running for appointments");
  } catch {
    console.log("Mongo connection failed");
  }

  const direction = getLangDir(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={dmSans.className}>
        <Toaster />

        {children}
      </body>
    </html>
  );
}
