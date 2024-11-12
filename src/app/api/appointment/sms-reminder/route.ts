import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import { sendSmsReminder } from "@/lib/twilio-sms";
import { getTranslations } from "next-intl/server";
import { getFirstName, getLastName } from "@/utils/nameUtilsForApiRoutes";
import { formatInTimeZone } from "date-fns-tz";

import connectToMongoDB from "@/lib/mongoose";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    await connectToMongoDB();
    const body = await req.json();
    const { appointmentId, locale, noMeetingLink } = body;

    const t = await getTranslations({
      locale,
      namespace: "SmsReminder",
    });

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select: "firstName lastName personalInfo.phoneNumber settings.timeZone",
      })
      .populate({
        path: "hostUserId",
        select: "firstName lastName",
      });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const clientPhone =
      appointment.participants[0].userId.personalInfo.phoneNumber;

    const hostFirstName = getFirstName(
      appointment.hostUserId.firstName,
      locale
    );
    const hostLastName = getLastName(appointment.hostUserId.lastName, locale);
    const appointmentStartTime = new Date(appointment.startDate);

    const clientTimeZone = appointment.participants[0].userId.settings.timeZone;

    if (!clientPhone) {
      return NextResponse.json(
        { error: "Client phone number not found" },
        { status: 400 }
      );
    }

    const formattedTime = formatInTimeZone(
      appointmentStartTime,
      clientTimeZone,
      "HH:mm"
    );

    await sendSmsReminder(
      clientPhone,
      hostFirstName,
      hostLastName,
      formattedTime,
      t,
      appointmentId,
      noMeetingLink
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
