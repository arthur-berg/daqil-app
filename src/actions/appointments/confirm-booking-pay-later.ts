"use server";

import { getUserById } from "@/data/user";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { sendNonPaidBookingConfirmationEmail } from "@/lib/mail";
import {
  cancelPayBeforeExpiredJobForAppointment,
  schedulePayAfterPaymentExpiredStatusUpdateJobs,
  schedulePaymentReminders,
} from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { getFullName } from "@/utils/formatName";
import mongoose from "mongoose";
import { getLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import connectToMongoDB from "@/lib/mongoose";
import { formatInTimeZone } from "date-fns-tz";

export const confirmBookingPayLater = async (
  appointmentId: string,
  appointmentDate: string,
  therapistId: string,
  appointmentTypeId: string
) => {
  await connectToMongoDB();

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

    const clientTimeZone = client?.settings?.timeZone || "UTC";
    const therapistTimeZone = therapist.settings.timeZone;

    const clientAppointmentDate = formatInTimeZone(
      new Date(appointment.startDate),
      clientTimeZone,
      "yyyy-MM-dd"
    );

    const clientAppointmentTime = formatInTimeZone(
      new Date(appointment.startDate),
      clientTimeZone,
      "HH:mm"
    );

    const therapistAppointmentDate = formatInTimeZone(
      new Date(appointment.startDate),
      therapistTimeZone,
      "yyyy-MM-dd"
    );

    const therapistAppointmentTime = formatInTimeZone(
      new Date(appointment.startDate),
      therapistTimeZone,
      "HH:mm"
    );

    const appointmentDetails = {
      clientDate: clientAppointmentDate,
      clientTime: clientAppointmentTime,
      therapistDate: therapistAppointmentDate,
      therapistTime: therapistAppointmentTime,
      therapistTimeZone,
      clientTimeZone,
      therapistName: `${await getFullName(
        therapist.firstName,
        therapist.lastName
      )}`,
      date: new Date(appointment.startDate),
      clientName: `${await getFullName(client.firstName, client.lastName)}`,
      appointmentId: appointmentId,
      appointmentTypeId: appointmentTypeId,
    };

    await sendNonPaidBookingConfirmationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    await schedulePaymentReminders(appointmentId, paymentExpiryDate, locale);
    await cancelPayBeforeExpiredJobForAppointment(appointmentId);
    await schedulePayAfterPaymentExpiredStatusUpdateJobs(
      appointmentId,
      paymentExpiryDate,
      locale
    );

    revalidatePath("/book-appointment");

    return { success: SuccessMessages("bookingConfirmed") };
  } catch (error) {
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Error confirming appointment:", error);

    return { error: ErrorMessages("somethingWentWrong") };
  }
};
