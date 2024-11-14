"use server";

import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import mongoose from "mongoose";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import connectToMongoDB from "@/lib/mongoose";

export const cancelTempReservation = async (appointmentId: string) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  let transactionCommitted = false;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await requireAuth([UserRole.CLIENT]);

    const appointment = await Appointment.findById(appointmentId).session(
      session
    );
    if (!appointment) {
      return { error: ErrorMessages("appointmentNotFound") };
    }

    console.log("appointment.status", appointment.status);

    if (appointment.status !== "temporarily-reserved") {
      revalidatePath("/book-appointment");
      return { redirect: true, error: ErrorMessages("appointmentNotReserved") };
    }

    await cancelAllScheduledJobsForAppointment(appointmentId);

    // Remove the appointmentId from the client's temporarilyReservedAppointments
    await User.updateOne(
      {
        _id: user.id,
        "appointments.temporarilyReservedAppointments": appointmentId,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": appointmentId,
        },
      },
      { session } // Include session in the update operation
    );

    // Remove the appointmentId from the therapist's temporarilyReservedAppointments
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
      { session } // Include session in the update operation
    );

    // Delete the appointment from the Appointment collection
    await Appointment.findByIdAndDelete(appointmentId, { session });

    // Commit the transaction
    await session.commitTransaction();
    transactionCommitted = true;
    session.endSession();

    revalidatePath("/book-appointment");

    return { success: SuccessMessages("reservationCancelled") };
  } catch (error) {
    // Abort the transaction if an error occurs
    if (!transactionCommitted) {
      await session.abortTransaction(); // Abort transaction only if it hasn't been committed
    }
    session.endSession();

    console.error("Error in cancelTempReservation:", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
