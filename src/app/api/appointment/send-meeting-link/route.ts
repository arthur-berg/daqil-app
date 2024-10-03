import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import { sendMeetingLink } from "@/lib/mail";
import { getTranslations } from "next-intl/server";
import { getFirstName, getLastName } from "@/utils/nameUtilsForApiRoutes";
import { formatInTimeZone } from "date-fns-tz";

import connectToMongoDB from "@/lib/mongoose";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    await connectToMongoDB();
    const body = await req.json();
    const { appointmentId, locale } = body;

    const t = await getTranslations({
      locale,
      namespace: "MeetingLinkEmail",
    });

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select: "firstName email lastName settings.timeZone",
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

    const clientEmail = appointment.participants[0].userId.email;

    const hostFirstName = getFirstName(
      appointment.hostUserId.firstName,
      locale
    );
    const hostLastName = getLastName(appointment.hostUserId.lastName, locale);
    const appointmentStartTime = new Date(appointment.startDate);

    const clientTimeZone = appointment.participants[0].userId.settings.timeZone;

    if (!clientEmail) {
      return NextResponse.json(
        { error: "Client email not found" },
        { status: 400 }
      );
    }

    const formattedTime = formatInTimeZone(
      appointmentStartTime,
      clientTimeZone,
      "HH:mm"
    );

    await sendMeetingLink(
      clientEmail,
      hostFirstName,
      hostLastName,
      formattedTime,
      t,
      appointmentId,
      locale
    );

    return NextResponse.json({
      message: `Meeting link email sent to ${clientEmail} for appointment ${appointmentId}.`,
    });
  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    return NextResponse.json(
      { error: "Failed to send SMS reminder" },
      { status: 500 }
    );
  }
});
