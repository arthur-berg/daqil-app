import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import connectToMongoDB from "@/lib/mongoose";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import User from "@/models/User";
import mongoose from "mongoose";

const markIntroSessionComplete = async (session: any, userId: string) => {
  return User.findByIdAndUpdate(
    userId,
    {
      $set: { "selectedTherapist.introCallDone": true },
    },
    { session }
  );
};

const updateAppointmentStatus = async (
  session: any,
  appointmentId: string,
  statusUpdate: object
) => {
  return Appointment.findByIdAndUpdate(appointmentId, statusUpdate, {
    session,
  });
};

const determineStatusUpdate = (
  hostShowUp: boolean,
  participantShowUp: boolean
) => {
  if (hostShowUp && participantShowUp) {
    return { status: "completed" };
  } else if (!hostShowUp && !participantShowUp) {
    return { status: "canceled", cancellationReason: "no-show-both" };
  } else if (!hostShowUp) {
    return { status: "canceled", cancellationReason: "no-show-host" };
  } else if (!participantShowUp) {
    return { status: "canceled", cancellationReason: "no-show-participant" };
  }
  return {};
};

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  await connectToMongoDB();

  try {
    const body = await req.json();
    const { appointmentId } = body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const { hostShowUp, participants, appointmentTypeId } = appointment;
    const participantShowUp = participants[0]?.showUp;
    const userId = participants[0]?.userId;

    const statusUpdate = determineStatusUpdate(hostShowUp, participantShowUp);
    console.log("statusUpdate", statusUpdate);
    console.log(
      "appointmentTypeId.toString() === APPOINTMENT_TYPE_ID_INTRO_SESSION",
      appointmentTypeId.toString() === APPOINTMENT_TYPE_ID_INTRO_SESSION
    );

    if (
      statusUpdate.status === "completed" &&
      appointmentTypeId.toString() === APPOINTMENT_TYPE_ID_INTRO_SESSION
    ) {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        // First update the user (mark intro session as done)
        await markIntroSessionComplete(session, userId);

        // Then update the appointment status
        await updateAppointmentStatus(session, appointmentId, statusUpdate);

        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      }
    } else {
      await updateAppointmentStatus(null, appointmentId, statusUpdate);
    }

    return NextResponse.json({
      message: `Appointment ${appointmentId} status updated successfully.`,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
});
