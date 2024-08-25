import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { appointmentId } = body;

    // Find the appointment and check if it's unpaid and past the expiry date
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Logic to cancel unpaid appointment
    if (appointment.payment.status === "pending") {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: "canceled",
        cancellationReason: "Payment was not completed in time",
      });
    }

    return NextResponse.json({
      message: `Appointment ${appointmentId} canceled due to unpaid status.`,
    });
  } catch (error) {
    console.error("Error canceling unpaid appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
};
