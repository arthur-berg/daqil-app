import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendReminderEmail } from "@/lib/mail";
import Appointment from "@/models/Appointment";
import { getTranslations } from "next-intl/server";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
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

    await sendReminderEmail(clientEmail, appointment, t);

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
