import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import mongoose from "mongoose";
import connectToMongoDB from "@/lib/mongoose";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  await connectToMongoDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();
    const { appointmentId } = body;

    const appointment = await Appointment.findById(appointmentId)
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

    if (appointment.payment.status === "pending") {
      await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          status: "canceled",
          cancellationReason: "not-paid-in-time",
        },
        { session }
      );

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
