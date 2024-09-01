import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendPaymentReminderEmail } from "@/lib/mail";
import Appointment from "@/models/Appointment";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { getFirstName } from "@/utils/nameUtilsForApiRoutes";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { appointmentId, locale } = body;

    const t = await getTranslations({
      locale,
      namespace: "PaymentReminderEmail",
    });

    const appointment = await Appointment.findById(appointmentId).populate(
      "participants.userId"
    );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const clientEmail = appointment.participants[0].userId.email;
    const clientFirstName = await getFirstName(
      appointment.participants[0].userId.firstName,
      locale
    );
    const appointmentStartTime = format(
      new Date(appointment.startDate),
      "hh:mm a"
    );

    await sendPaymentReminderEmail(
      clientEmail,
      clientFirstName,
      appointmentId,
      appointmentStartTime,
      t
    );

    return NextResponse.json({
      message: `Payment reminder sent to ${clientEmail} for appointment ${appointmentId}.`,
    });
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    return NextResponse.json(
      { error: "Failed to send payment reminder" },
      { status: 500 }
    );
  }
});
