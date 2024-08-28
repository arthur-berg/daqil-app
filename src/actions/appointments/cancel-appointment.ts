"use server";

import * as z from "zod";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { UserRole } from "@/generalTypes";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { sendAppointmentCancellationEmail } from "@/lib/mail";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { CancelAppointmentSchema } from "@/schemas";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export const cancelAppointment = async (
  values: z.infer<typeof CancelAppointmentSchema>
) => {
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
        select: "firstName lastName email",
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

    if (isClient) {
      const participant = appointment.participants.some(
        (p: any) => p.userId._id.toString() === user.id
      );

      if (!participant) {
        return { error: ErrorMessages("notAuthorized") };
      }
    }

    // **Remove any scheduled jobs for this appointment**

    await cancelAllScheduledJobsForAppointment(appointmentId);

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "canceled",
      cancellationReason: "custom",
      customCancellationReason: reason,
    });

    // Send cancellation emails to both therapist and client
    const therapistEmail = appointment.hostUserId.email;
    const clientEmail = appointment.participants[0].userId.email;
    const appointmentDetails = {
      date: format(appointment.startDate, "yyyy-MM-dd"),
      time: format(appointment.startDate, "HH:mm"),
      reason,
      therapistName: `${appointment.hostUserId.firstName} ${appointment.hostUserId.lastName}`,
      clientName: `${appointment.participants[0].userId.firstName} ${appointment.participants[0].userId.lastName}`,
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
