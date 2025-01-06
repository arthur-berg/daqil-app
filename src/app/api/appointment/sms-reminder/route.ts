import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import User from "@/models/User";
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
    const {
      appointmentId,
      locale,
      reminder24h,
      reminder2h,
      reminderTherapist,
    } = body;

    const t = await getTranslations({
      locale,
      namespace: "SmsReminder",
    });
    if (!User.schema) {
      throw new Error("User schema is not registered.");
    }
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select: "firstName lastName personalInfo.phoneNumber settings.timeZone",
      })
      .populate({
        path: "hostUserId",
        select: "firstName lastName personalInfo.phoneNumber",
      });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    let phoneNumber;

    if (!!reminderTherapist) {
      phoneNumber = appointment.hostUserId.personalInfo.phoneNumber;
    } else {
      phoneNumber = appointment.participants[0].userId.personalInfo.phoneNumber;
    }

    const hostFirstName = getFirstName(
      appointment.hostUserId.firstName,
      locale
    );
    const hostLastName = getLastName(appointment.hostUserId.lastName, locale);
    const clientFirstName = getFirstName(
      appointment.participants[0].userId.firstName,
      locale
    );
    const clientLastName = getLastName(
      appointment.participants[0].userId.lastName,
      locale
    );

    const appointmentStartTime = new Date(appointment.startDate);

    const clientTimeZone = appointment.participants[0].userId.settings.timeZone;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 400 }
      );
    }

    const formattedTime = formatInTimeZone(
      appointmentStartTime,
      clientTimeZone,
      "HH:mm"
    );

    const reminders = {
      reminder24h: !!reminder24h,
      reminder2h: !!reminder2h,
      reminderTherapist: !!reminderTherapist,
    };

    await sendSmsReminder(
      phoneNumber,
      hostFirstName,
      hostLastName,
      formattedTime,
      t,
      appointmentId,
      reminders,
      clientFirstName,
      clientLastName
    );

    return NextResponse.json({
      message: `SMS reminder sent to ${phoneNumber} for appointment ${appointmentId}.`,
    });
  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    return NextResponse.json(
      { error: `Failed to send SMS reminder, error: ${error}` },
      { status: 500 }
    );
  }
});
