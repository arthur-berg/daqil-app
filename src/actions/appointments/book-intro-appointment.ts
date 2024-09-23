"use server";

import { getFirstName, getFullName } from "./../../utils/formatName";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getTherapistById } from "@/data/user";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { format } from "date-fns";
import mongoose from "mongoose";
import { getLocale, getTranslations } from "next-intl/server";
import { updateAppointments } from "./utils";
import { revalidatePath } from "next/cache";
import connectToMongoDB from "@/lib/mongoose";
import { formatInTimeZone } from "date-fns-tz";
import { sendIntroBookingConfirmationMail } from "@/lib/mail";
import {
  scheduleReminderJobs,
  scheduleStatusUpdateJob,
} from "@/lib/schedule-appointment-jobs";

export const bookIntroAppointment = async (
  appointmentType: any,
  therapistId: string,
  startDate: Date
) => {
  await connectToMongoDB();
  const locale = await getLocale();

  const [SuccessMessages, ErrorMessages, t, tAppointmentTypes] =
    await Promise.all([
      getTranslations("SuccessMessages"),
      getTranslations("ErrorMessages"),
      getTranslations("AppointmentAction"),
      getTranslations("AppointmentTypes"),
    ]);

  const therapist = (await getTherapistById(therapistId)) as any;

  if (!therapist) {
    return { error: ErrorMessages("therapistNotExist") };
  }

  const isFree = appointmentType._id === APPOINTMENT_TYPE_ID_INTRO_SESSION;

  if (!isFree) {
    return { error: ErrorMessages("invalidFields") };
  }

  let transactionCommitted = false;

  const session = await mongoose.startSession();
  session.startTransaction();

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  try {
    const client = await requireAuth([UserRole.CLIENT]);

    const appointmentData = {
      title: `${tAppointmentTypes(appointmentType._id)}`,
      startDate,
      endDate,
      participants: [{ userId: client.id, showUp: false }],
      appointmentTypeId: appointmentType._id,
      hostUserId: therapistId,
      durationInMinutes: appointmentType.durationInMinutes,
      payment: {
        method: "payBeforeBooking",
        status: "paid",
      },
      status: "confirmed",
      price: appointmentType.price,
      currency: appointmentType.currency,
    };

    const appointment = await Appointment.create([appointmentData], {
      session,
    });

    if (!appointment) {
      throw new Error("Failed to create appointment.");
    }

    const appointmentId = appointment[0]._id;
    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    // Check and update client's selected therapist

    await User.findByIdAndUpdate(
      client.id,
      {
        $set: {
          "selectedTherapist.therapist": therapistId,
        },
      },
      { session }
    );

    // Update the clients appointments
    await updateAppointments(
      client.id,
      appointmentDate,
      appointmentId,
      session,
      "bookedAppointments"
    );

    // Update the therapist's appointments

    await updateAppointments(
      therapistId,
      appointmentDate,
      appointmentId,
      session,
      "bookedAppointments"
    );

    await session.commitTransaction();
    transactionCommitted = true;
    session.endSession();

    const clientTimeZone = client.settings?.timeZone || "UTC";
    const therapistTimeZone = therapist.settings.timeZone || "UTC";

    const clientEmail = client.email;
    const therapistEmail = therapist.email;

    const fetchedAppointment = appointment[0];

    const therapistAppointmentDate = formatInTimeZone(
      new Date(fetchedAppointment.startDate),
      therapistTimeZone,
      "yyyy-MM-dd"
    );

    const therapistAppointmentTime = formatInTimeZone(
      new Date(fetchedAppointment.startDate),
      therapistTimeZone,
      "HH:mm"
    );

    const clientAppointmentDate = formatInTimeZone(
      new Date(fetchedAppointment.startDate),
      clientTimeZone,
      "yyyy-MM-dd"
    );
    const clientAppointmentTime = formatInTimeZone(
      new Date(fetchedAppointment.startDate),
      clientTimeZone,
      "HH:mm"
    );

    const therapistName = await getFullName(
      therapist.firstName,
      therapist.lastName
    );

    const clientName = await getFullName(client.firstName, client.lastName);

    const appointmentDetails = {
      clientDate: clientAppointmentDate,
      clientTime: clientAppointmentTime,
      therapistDate: therapistAppointmentDate,
      therapistTime: therapistAppointmentTime,
      therapistName: therapistName,
      clientName: clientName,
      durationInMinutes: fetchedAppointment.durationInMinutes,
    };

    await sendIntroBookingConfirmationMail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    revalidatePath("/appointments");
    revalidatePath("/book-appointment");

    await scheduleReminderJobs(fetchedAppointment, locale);
    await scheduleStatusUpdateJob(fetchedAppointment);

    return {
      success: SuccessMessages("bookingConfirmed"),
    };
  } catch (error) {
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Error in cancelTempReservation:", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
