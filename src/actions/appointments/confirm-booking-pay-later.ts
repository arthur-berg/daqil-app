"use server";

import { getUserById } from "@/data/user";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { sendNonPaidBookingConfirmationEmail } from "@/lib/mail";
import {
  schedulePaymentReminders,
  scheduleRemoveUnpaidJobs,
} from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import mongoose from "mongoose";
import { getLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export const confirmBookingPayLater = async (
  appointmentId: string,
  appointmentDate: string,
  therapistId: string,
  appointmentTypeId: string
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const locale = await getLocale();

  const client = await requireAuth([UserRole.CLIENT, UserRole.ADMIN]);

  const therapist = await getUserById(therapistId);

  if (!therapist) {
    return { error: ErrorMessages("therapistNotExist") };
  }

  let transactionCommitted = false;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the appointment to ensure it exists
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return { error: ErrorMessages("appointmentNotExist") };
    }

    // Check if the appointment is in the temporarilyReservedAppointments
    const clientUpdateResult = await User.updateOne(
      {
        _id: client.id,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": appointmentId,
        },
        $push: {
          "appointments.$.bookedAppointments": appointmentId,
        },
      },
      { session }
    );

    const therapistUpdateResult = await User.updateOne(
      {
        _id: therapist.id,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": appointmentId,
        },
        $push: {
          "appointments.$.bookedAppointments": appointmentId,
        },
      },
      { session }
    );

    if (
      clientUpdateResult.modifiedCount === 0 ||
      therapistUpdateResult.modifiedCount === 0
    ) {
      throw new Error(ErrorMessages("appointmentUpdateFailed"));
    }

    const paymentExpiryDate = new Date(appointment.startDate);
    paymentExpiryDate.setHours(paymentExpiryDate.getHours() - 1);

    await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "confirmed",
        "payment.method": "payAfterBooking",
        "payment.paymentExpiryDate": paymentExpiryDate,
        "payment.status": "pending",
      },
      { session }
    );

    await session.commitTransaction();
    transactionCommitted = true;
    session.endSession();

    const therapistEmail = therapist.email;
    const clientEmail = client.email;

    const appointmentDetails = {
      date: appointment.startDate,
      therapistName: `${therapist.firstName} ${therapist.lastName}`,
      clientName: `${client.firstName} ${client.lastName}`,
      appointmentId: appointmentId,
      appointmentTypeId: appointmentTypeId,
    };

    await sendNonPaidBookingConfirmationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    await schedulePaymentReminders(appointmentId, paymentExpiryDate, locale);
    await scheduleRemoveUnpaidJobs(appointmentId, paymentExpiryDate);

    revalidatePath("/book-appointment");

    return { success: SuccessMessages("bookingConfirmed") };
  } catch (error) {
    if (!transactionCommitted) {
      await session.abortTransaction(); // Abort transaction only if it hasn't been committed
    }
    session.endSession();

    console.error("Error confirming appointment:", error);

    return { error: ErrorMessages("somethingWentWrong") };
  }
};
