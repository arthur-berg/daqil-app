"use server";

import Appointment from "@/models/Appointment";
import User from "@/models/User";
import {
  addTagToMailchimpUser,
  sendIntroBookingConfirmationMail,
} from "@/lib/mail";
import {
  cancelPaymentRelatedJobsForAppointment,
  scheduleReminderJobs,
  scheduleStatusUpdateJob,
} from "@/lib/schedule-appointment-jobs";
import { getLocale, getTranslations } from "next-intl/server";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";

import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import { findAppointmentById } from "@/app/api/webhook/stripe/helpers";
import { requireAuth } from "@/lib/auth";
import { UserRole } from "@/generalTypes";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import mongoose from "mongoose";

const updateAppointments = async (
  appointment: any,
  appointmentDate: string
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const clientId = appointment.participants[0].userId;
    const therapistId = appointment.hostUserId;

    const client = await User.findOneAndUpdate(
      {
        _id: clientId,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": appointment._id,
        },
        $addToSet: { "appointments.$.bookedAppointments": appointment._id },
      },
      { session }
    );

    const therapist = await User.findOneAndUpdate(
      {
        _id: therapistId,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": appointment._id,
        },
        $addToSet: { "appointments.$.bookedAppointments": appointment._id },
      },
      { session }
    );

    /*  const previousTherapistId = client.selectedTherapist?.therapist;

    if (
      previousTherapistId &&
      previousTherapistId.toString() !== therapistId.toString()
    ) {
      await User.findByIdAndUpdate(
        previousTherapistId,
        { $pull: { assignedClients: clientId } },
        { session }
      );
    }

    if (!therapist.assignedClients?.includes(clientId)) {
      await User.findByIdAndUpdate(
        therapistId,
        { $addToSet: { assignedClients: clientId } },
        { session }
      );
    } */

    await User.findByIdAndUpdate(
      clientId,
      { $set: { "selectedTherapist.therapist": therapistId } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export async function confirmIntroBooking(appointmentId: string) {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const locale = await getLocale();
  try {
    await requireAuth([UserRole.CLIENT]);
    const appointment = await findAppointmentById(appointmentId);

    if (!appointment) {
      console.error(`Appointment ${appointmentId} not found.`);
      return { error: "Appointment not found." };
    }

    /*  if (appointment.status === "confirmed") {
      return {
        redirect: true,
        error: ErrorMessages("appointmentAlreadyConfirmed"),
      };
    } */

    const isIntroCall =
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION;

    if (!isIntroCall) {
      return { error: ErrorMessages("isNotIntroCall") };
    }

    // Proceed to update appointment status, send emails, and schedule jobs
    const appointmentDate = formatInTimeZone(
      new Date(appointment.startDate),
      "UTC",
      "yyyy-MM-dd"
    );

    await updateAppointments(appointment, appointmentDate);

    // Update the appointment status to "confirmed"
    await Appointment.findByIdAndUpdate(appointment._id, {
      status: "confirmed",
      "payment.status": "paid",
    });

    // Email and reminder logic
    const client = appointment.participants[0].userId;
    const therapist = appointment.hostUserId;
    const clientEmail = client.email;
    const therapistEmail = therapist.email;

    const clientTimeZone = client.settings.timeZone || "UTC";
    const therapistTimeZone = therapist.settings.timeZone || "UTC";

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

    const appointmentDetails = {
      clientDate: clientAppointmentDate,
      clientTime: clientAppointmentTime,
      therapistDate: therapistAppointmentDate,
      therapistTime: therapistAppointmentTime,
      therapistName: `${await getFullName(
        therapist.firstName,
        therapist.lastName
      )}`,
      clientName: `${await getFullName(client.firstName, client.lastName)}`,
      durationInMinutes: appointment.durationInMinutes,
      therapistTimeZone,
      clientTimeZone,
    };

    const t = await getTranslations({
      locale,
      namespace: "BookingConfirmedIntroCall",
    });

    // Update the client's selected therapist
    await User.findByIdAndUpdate(client._id, {
      $set: {
        "selectedTherapist.therapist": therapist._id,
      },
    });

    // Add a tag to the client's profile in Mailchimp
    await addTagToMailchimpUser(clientEmail, "intro-call-booked");

    // Send the intro booking confirmation email with the confirmation link
    await sendIntroBookingConfirmationMail(
      therapistEmail,
      clientEmail,
      appointmentDetails,
      t,
      locale
    );

    // Revalidate paths to update the cache
    revalidatePath(`/book-appointment`);
    revalidatePath(`/appointments`);

    // Cancel any payment-related jobs for the appointment
    await cancelPaymentRelatedJobsForAppointment(appointment._id);

    // Schedule reminder jobs and status update jobs
    await scheduleReminderJobs(appointment, locale);
    await scheduleStatusUpdateJob(appointment);

    return { success: SuccessMessages("appointmentBookingConfirmed") };
  } catch (error) {
    return { error: ErrorMessages("somethingWentWrong") };
  }
}
