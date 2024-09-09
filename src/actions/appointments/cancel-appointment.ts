"use server";

import * as z from "zod";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { UserRole } from "@/generalTypes";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { sendAppointmentCancellationEmail } from "@/lib/mail";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { CancelAppointmentSchema } from "@/schemas";
import { differenceInHours, format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const cancelAppointment = async (
  values: z.infer<typeof CancelAppointmentSchema>
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  const validatedFields = CancelAppointmentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { appointmentId, reason } = validatedFields.data;

  try {
    const user = await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
      UserRole.CLIENT,
    ]);

    const { isTherapist, isClient } = await getCurrentRole();

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select:
          "firstName lastName email stripeCustomerId stripePaymentMethodId",
      })
      .populate("hostUserId", "email firstName lastName");

    if (!appointment) {
      return { error: ErrorMessages("appointmentNotExist") };
    }

    if (appointment.status === "canceled") {
      return { error: ErrorMessages("appointmentAlreadyCanceled") };
    }

    if (appointment.status === "completed") {
      return { error: ErrorMessages("appointmentAlreadyCompleted") };
    }

    if (isTherapist) {
      const isAuthorized =
        user.id === appointment.hostUserId._id.toString() ||
        user.role === UserRole.ADMIN;

      if (!isAuthorized) {
        return { error: ErrorMessages("notAuthorized") };
      }
    }

    let refundIssued = false;
    let refundAmount = 0;

    if (isClient) {
      const participant = appointment.participants.some(
        (p: any) => p.userId._id.toString() === user.id
      );

      if (!participant) {
        return { error: ErrorMessages("notAuthorized") };
      }

      // Check if the appointment is eligible for a refund (more than 48 hours away)
      const hoursUntilAppointment = differenceInHours(
        new Date(appointment.startDate),
        new Date()
      );

      if (hoursUntilAppointment > 24) {
        // Fetch the payment intent using the appointmentId as metadata
        const paymentIntents = await stripe.paymentIntents.list({
          customer: appointment.participants[0].userId.stripeCustomerId,
          limit: 100, // Adjust the limit as needed
        });

        const paymentIntent = paymentIntents.data.find(
          (pi) => pi.metadata && pi.metadata.appointmentId === appointmentId
        );

        if (paymentIntent) {
          try {
            const refund = await stripe.refunds.create({
              payment_intent: paymentIntent.id,
            });
            refundIssued = true;
            refundAmount = refund.amount / 100;
          } catch (refundError) {
            console.error("Error processing refund:", refundError);
            return { error: ErrorMessages("refundFailed") };
          }
        }
      }
    }

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "canceled",
      cancellationReason: "custom",
      customCancellationReason: reason,
    });

    const therapistEmail = appointment.hostUserId.email;
    const clientEmail = appointment.participants[0].userId.email;
    const appointmentDetails = {
      date: format(appointment.startDate, "yyyy-MM-dd"),
      time: format(appointment.startDate, "HH:mm"),
      reason,
      therapistName: `${await getFullName(
        appointment.hostUserId.firstName,
        appointment.hostUserId.lastName
      )}`,
      clientName: `${await getFullName(
        appointment.participants[0].userId.firstName,
        appointment.participants[0].userId.lastName
      )}`,
      refundIssued,
      refundAmount,
    };

    if (
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION
    ) {
      await User.findByIdAndUpdate(appointment.participants[0].userId._id, {
        $set: {
          "selectedTherapist.therapist": null,
        },
      });
    }

    await cancelAllScheduledJobsForAppointment(appointmentId);

    await sendAppointmentCancellationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    revalidatePath("/therapist/appointments");
    revalidatePath("/appointments");
    revalidatePath("/book-appointment");

    return { success: SuccessMessages("appointmentCanceled") };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};
