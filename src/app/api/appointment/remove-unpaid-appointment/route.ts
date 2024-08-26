import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
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

    // Check if the appointment's payment status is pending

    if (appointment.payment.status === "pending") {
      // Remove the appointment from the client's temporarilyReservedAppointments
      await User.updateOne(
        {
          _id: appointment.participants[0].userId,
          "appointments.temporarilyReservedAppointments": appointmentId,
        }, // assuming first participant is the client
        {
          $pull: {
            "appointments.$.temporarilyReservedAppointments": appointmentId,
          },
        }
      );

      // Remove the appointment from the therapist's temporarilyReservedAppointments
      await User.updateOne(
        {
          _id: appointment.hostUserId,
          "appointments.temporarilyReservedAppointments": appointmentId,
        },
        {
          $pull: {
            "appointments.$.temporarilyReservedAppointments": appointmentId,
          },
        }
      );

      // Delete the appointment from the Appointment collection
      await Appointment.findByIdAndDelete(appointmentId);

      await cancelAllScheduledJobsForAppointment(appointmentId);

      return NextResponse.json({
        message: `Appointment ${appointmentId} has been removed due to unpaid status.`,
      });
    }

    return NextResponse.json({
      message: `Appointment ${appointmentId} does not have pending payment status.`,
    });
  } catch (error) {
    console.error("Error canceling unpaid appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
});
