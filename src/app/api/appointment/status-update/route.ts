import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";

const updateAppointmentStatus = async (
  appointmentId: string,
  statusUpdate: object
) => {
  return Appointment.findByIdAndUpdate(appointmentId, statusUpdate);
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

    const { hostShowUp, participants } = appointment;
    const participantShowUp = participants[0]?.showUp;

    const statusUpdate = determineStatusUpdate(hostShowUp, participantShowUp);

    await updateAppointmentStatus(appointmentId, statusUpdate);

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
