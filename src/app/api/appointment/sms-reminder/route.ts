import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import { sendSmsReminder } from "@/lib/twilio-sms";
import { format } from "date-fns"; // Import format from date-fns
import { getTranslations } from "next-intl/server";
import { getFirstName, getLastName } from "@/utils/nameUtilsForApiRoutes";
import connectToMongoDB from "@/lib/mongoose";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    await connectToMongoDB();
    const body = await req.json();
    const { appointmentId, locale } = body;

    const t = await getTranslations({
      locale,
      namespace: "SmsReminder",
    });

    const appointment = await Appointment.findById(appointmentId)
      .populate("participants.userId")
      .populate("hostUserId"); // Populate the host user details

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const clientPhone =
      appointment.participants[0].userId.personalInfo.phoneNumber;
    const hostFirstName = await getFirstName(
      appointment.hostUserId.firstName,
      locale
    );
    const hostLastName = await getLastName(
      appointment.hostUserId.lastName,
      locale
    );
    const appointmentStartTime = new Date(appointment.startDate);

    if (!clientPhone) {
      return NextResponse.json(
        { error: "Client phone number not found" },
        { status: 400 }
      );
    }

    const formattedTime = format(appointmentStartTime, "HH:mm");

    await sendSmsReminder(
      clientPhone,
      hostFirstName,
      hostLastName,
      formattedTime,
      t
    );

    return NextResponse.json({
      message: `SMS reminder sent to ${clientPhone} for appointment ${appointmentId}.`,
    });
  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    return NextResponse.json(
      { error: "Failed to send SMS reminder" },
      { status: 500 }
    );
  }
});
