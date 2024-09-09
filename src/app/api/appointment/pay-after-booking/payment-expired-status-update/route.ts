import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import { sendClientNotPaidInTimeEmail } from "@/lib/mail";
import { getTranslations } from "next-intl/server";
import { getFullName } from "@/utils/nameUtilsForApiRoutes";
import connectToMongoDB from "@/lib/mongoose";
import { formatInTimeZone } from "date-fns-tz";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  await connectToMongoDB();

  try {
    const body = await req.json();
    const { appointmentId, locale } = body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select: "firstName lastName email settings.timeZone",
      })
      .populate({
        path: "hostUserId",
        select: "firstName lastName email settings.timeZone",
      });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const t = await getTranslations({
      locale,
      namespace: "ClientNotPaidInTimeEmail",
    });

    if (appointment.payment.status === "pending") {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: "canceled",
        cancellationReason: "not-paid-in-time",
      });

      const client = appointment.participants[0].userId;
      const therapist = appointment.hostUserId;

      const clientTimeZone = client.settings?.timeZone || "UTC";
      const therapistTimeZone = therapist.settings?.timeZone || "UTC";

      const clientAppointmentDate = formatInTimeZone(
        new Date(appointment.startDate),
        clientTimeZone,
        "PPPP"
      );

      const clientAppointmentTime = formatInTimeZone(
        new Date(appointment.startDate),
        clientTimeZone,
        "HH:mm"
      );

      const therapistAppointmentDate = formatInTimeZone(
        new Date(appointment.startDate),
        therapistTimeZone,
        "PPPP"
      );

      const therapistAppointmentTime = formatInTimeZone(
        new Date(appointment.startDate),
        therapistTimeZone,
        "HH:mm"
      );

      await sendClientNotPaidInTimeEmail(
        appointment.participants[0].userId.email,
        appointment.hostUserId.email,
        {
          clientDate: clientAppointmentDate,
          clientTime: clientAppointmentTime,
          therapistDate: therapistAppointmentDate,
          therapistTime: therapistAppointmentTime,
          therapistName: `${getFullName(
            appointment.hostUserId.firstName,
            appointment.hostUserId.lastName,
            locale
          )} `,
          clientName: `${getFullName(
            appointment.participants[0].userId.firstName,
            appointment.participants[0].userId.lastName,
            locale
          )}`,
        },
        t
      );

      await cancelAllScheduledJobsForAppointment(appointment);

      return NextResponse.json({
        message: `Appointment ${appointmentId} status has been updated due to that the client did not pay on time.`,
      });
    } else {
      return NextResponse.json({
        message: `Appointment ${appointmentId} does not have pending payment status.`,
      });
    }
  } catch (error) {
    console.error("Error canceling unpaid appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
});
