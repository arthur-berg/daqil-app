import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import { sendClientNotPaidInTimeEmail } from "@/lib/mail";
import { getTranslations } from "next-intl/server";
import mongoose from "mongoose";
import { getFullName } from "@/utils/nameUtilsForApiRoutes";
import connectToMongoDB from "@/lib/mongoose";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  await connectToMongoDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();
    const { appointmentId, locale } = body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "canceled",
        cancellationReason: "not-paid-in-time",
      },
      { session }
    )
      .populate("participants.userId")
      .populate("hostUserId");

    if (!appointment) {
      await session.abortTransaction();
      session.endSession();
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
      await User.updateOne(
        {
          _id: appointment.participants[0].userId,
          "appointments.temporarilyReservedAppointments": appointmentId,
        },
        {
          $pull: {
            "appointments.$.temporarilyReservedAppointments": appointmentId,
          },
        },
        { session }
      );

      await User.updateOne(
        {
          _id: appointment.hostUserId,
          "appointments.temporarilyReservedAppointments": appointmentId,
        },
        {
          $pull: {
            "appointments.$.temporarilyReservedAppointments": appointmentId,
          },
        },
        { session }
      );

      if (appointment.payment.method === "payAfterBooking") {
        await sendClientNotPaidInTimeEmail(
          appointment.participants[0].userId.email,
          appointment.hostUserId.email,
          {
            date: appointment.startDate,
            time: appointment.startDate,
            therapistName: `${await getFullName(
              appointment.hostUserId.firstName,
              appointment.hostUserId.lastName,
              locale
            )} `,
            clientName: `${await getFullName(
              appointment.participants[0].userId.firstName,
              appointment.participants[0].userId.lastName,
              locale
            )}`,
          },
          t
        );
      }

      await cancelAllScheduledJobsForAppointment(appointment);

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        message: `Appointment ${appointmentId} status has been updated due to that the client did not pay on time.`,
      });
    } else {
      await session.abortTransaction();
      session.endSession();

      return NextResponse.json({
        message: `Appointment ${appointmentId} does not have pending payment status.`,
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error canceling unpaid appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
});
