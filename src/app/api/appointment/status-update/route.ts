import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import Appointment from "@/models/Appointment";
import connectToMongoDB from "@/lib/mongoose";
import { chargeNoShowFee } from "@/actions/stripe";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";

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

    const appointment = await Appointment.findById(appointmentId).populate({
      path: "participants.userId",
      select: "stripeCustomerId stripePaymentMethodId",
    });
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

    const isIntroAppointment =
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION;

    if (
      statusUpdate.cancellationReason === "no-show-participant" &&
      isIntroAppointment
    ) {
      const customerId = participants[0]?.userId?.stripeCustomerId;
      const paymentMethodId = participants[0]?.userId?.stripePaymentMethodId;

      if (customerId && paymentMethodId) {
        const chargeResult = await chargeNoShowFee(customerId, paymentMethodId);

        if (chargeResult.error) {
          console.error(
            `Failed to charge no-show fee for appointment ${appointmentId}:`,
            chargeResult.error
          );
          return NextResponse.json(
            { error: "Failed to charge no-show fee" },
            { status: 500 }
          );
        }
      } else {
        console.error(
          `Missing Stripe customer or payment method ID for appointment ${appointmentId}`
        );
      }
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
