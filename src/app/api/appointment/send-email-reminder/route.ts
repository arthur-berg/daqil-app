import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendReminderEmail } from "@/lib/mail";
import Appointment from "@/models/Appointment";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { getFirstName, getFullName } from "@/utils/nameUtilsForApiRoutes";
import { format } from "date-fns";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    await connectToMongoDB();

    const body = await req.json();

    const { appointmentId, locale } = body;

    const t = await getTranslations({
      locale,
      namespace: "ReminderEmail",
    });

    const appointment = await Appointment.findById(appointmentId)
      .populate("participants.userId")
      .populate("hostUserId");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const clientEmail = appointment.participants[0].userId.email;

    const appointmentDetails = {
      date: format(new Date(appointment.startDate), "PPPP"),
      time: format(new Date(appointment.startDate), "HH:mm"),
      therapistName: `${getFullName(
        appointment.hostUserId.firstName,
        appointment.hostUserId.lastName,
        locale
      )} `,
      clientName: `${getFirstName(
        appointment.participants[0].userId.firstName,
        locale
      )}`,
    };

    await sendReminderEmail(clientEmail, appointmentDetails, t);

    return NextResponse.json({
      message: `Email reminder sent to ${clientEmail} for appointment ${appointmentId}.`,
    });
  } catch (error) {
    console.error("Error sending email reminder:", error);
    return NextResponse.json(
      { error: "Failed to send email reminder" },
      { status: 500 }
    );
  }
});
