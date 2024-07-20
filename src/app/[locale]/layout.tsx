import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getLangDir } from "rtl-detect";
import "@/app/globals.css";

import connectToMongoDB from "@/lib/mongoose";
import { scheduleJobToCheckAppointmentStatus } from "@/lib/schedulerJobs";
import Appointment from "@/models/Appointment";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

const initializeScheduledJobs = async () => {
  const now = new Date();
  const pastAppointments = await Appointment.find({
    endDate: { $lt: now },
    status: { $in: ["confirmed", "pending"] },
  });
  const futureAppointments = await Appointment.find({
    endDate: { $gte: now },
    status: { $in: ["confirmed", "pending"] },
  });
  const pendingAppointments = [...pastAppointments, ...futureAppointments];

  pendingAppointments.forEach((appointment) => {
    scheduleJobToCheckAppointmentStatus(appointment._id, appointment.endDate);
  });
};

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
  try {
    await connectToMongoDB();
    await initializeScheduledJobs();

    console.log("Mongo connected and scheduler jobs running for appointments");
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
