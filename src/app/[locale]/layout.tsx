import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getLangDir } from "rtl-detect";
import cron from "node-cron";
import "@/app/globals.css";

import connectToMongoDB from "@/lib/mongoose";
import {
  checkAndCancelUnpaidAppointments,
  checkAndUpdateAppointmentStatuses,
} from "@/lib/cros-jobs";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Zakina app",
  description: "Zakina app",
};

// Cron job setup as you defined
const runCronJobs = async () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log(
      "Running scheduled job to check appointment statuses and payment deadlines"
    );

    await checkAndUpdateAppointmentStatuses();
    await checkAndCancelUnpaidAppointments();
  });
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
    await runCronJobs();
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
