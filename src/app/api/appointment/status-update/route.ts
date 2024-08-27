import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
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

    const hostShowUp = appointment.hostShowUp;
    const participantShowUp = appointment.participants[0]?.showUp;

    let statusUpdate = {};

    if (hostShowUp && participantShowUp) {
      statusUpdate = { status: "completed" };
    } else if (!hostShowUp && !participantShowUp) {
      statusUpdate = {
        status: "canceled",
        cancellationReason: "no-show-both",
      };
    } else if (!hostShowUp) {
      statusUpdate = {
        status: "canceled",
        cancellationReason: "no-show-host",
      };
    } else if (!participantShowUp) {
      statusUpdate = {
        status: "canceled",
        cancellationReason: "no-show-participant",
      };
    }

    await Appointment.findByIdAndUpdate(appointmentId, statusUpdate);

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
