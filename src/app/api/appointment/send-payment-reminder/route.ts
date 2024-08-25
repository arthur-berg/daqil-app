import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendPaymentReminderEmail } from "@/lib/mail";
import Appointment from "@/models/Appointment";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { appointmentId } = body;

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

    await sendPaymentReminderEmail(clientEmail, appointmentId);

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
