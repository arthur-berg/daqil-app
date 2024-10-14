"use server";

import * as z from "zod";
import { AppointmentSchema } from "@/schemas";
import { getLocale, getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { getAppointmentTypeById } from "@/data/appointment-types";
import User from "@/models/User";
import { UserRole } from "@/generalTypes";
import mongoose from "mongoose";
import Appointment from "@/models/Appointment";
import { format } from "date-fns";
import {
  schedulePayAfterPaymentExpiredStatusUpdateJobs,
  schedulePaymentReminders,
  scheduleStatusUpdateJob,
} from "@/lib/schedule-appointment-jobs";
import { checkTherapistAvailability, updateAppointments } from "./utils";
import connectToMongoDB from "@/lib/mongoose";
import { sendNonPaidBookingConfirmationEmail } from "@/lib/mail";
import { getFullName } from "@/utils/formatName";
import { formatInTimeZone } from "date-fns-tz";
import { getUserById } from "@/data/user";

export const scheduleAppointment = async (
  values: z.input<typeof AppointmentSchema>
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const locale = await getLocale();
  const user = await requireAuth([UserRole.THERAPIST]);

  if (!user) {
    return {
      error: ErrorMessages("therapistNotExist"),
    };
  }

  const therapist = await getUserById(user.id);

  const therapistId = therapist._id.toString();

  const validatedFields = AppointmentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const {
    title,
    description,
    startDate,
    paid,
    status,
    clientId,
    appointmentTypeId,
  } = validatedFields.data;

  const appointmentType = await getAppointmentTypeById(appointmentTypeId);

  const client = await User.findById(clientId);

  if (!appointmentType) {
    return { error: ErrorMessages("appointmentTypeNotExist") };
  }

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  const availabilityCheck = await checkTherapistAvailability(
    therapist,
    startDate,
    endDate,
    appointmentType
  );

  if (!availabilityCheck.available) {
    return { error: availabilityCheck.message };
  }

  let appointmentCost: Record<string, unknown> = {};

  if ("price" in appointmentType) {
    appointmentCost.price = appointmentType.price;
    appointmentCost.currency = appointmentType.currency;
  }
  if ("credits" in appointmentType) {
    appointmentCost.price = appointmentType.price;
  }

  let transactionCommitted = false;

  const session = await mongoose.startSession();
  session.startTransaction();

  const paymentExpiryDate = new Date(startDate);

  paymentExpiryDate.setHours(paymentExpiryDate.getHours() - 1);

  try {
    const appointment = await Appointment.create(
      [
        {
          title,
          description,
          startDate,
          endDate,
          appointmentTypeId: appointmentType._id,
          payment: {
            method: "payAfterBooking",
            status: "pending",
            paymentExpiryDate,
          },
          status: "confirmed",
          participants: [{ userId: clientId, showUp: false }],
          hostUserId: therapistId,
          durationInMinutes: appointmentType.durationInMinutes,
          ...appointmentCost,
        },
      ],
      { session }
    );

    const appointmentId = appointment[0]._id;

    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    await schedulePaymentReminders(appointmentId, paymentExpiryDate, locale);

    await schedulePayAfterPaymentExpiredStatusUpdateJobs(
      appointmentId,
      paymentExpiryDate,
      locale
    );

    // Check and update client's selected therapist

    if (
      client.selectedTherapist &&
      client.selectedTherapist.therapist?.toString() !== therapistId
    ) {
      // Update the previous therapist in selectedTherapistHistory
      await User.updateOne(
        { _id: clientId, "selectedTherapistHistory.current": true },
        {
          $set: {
            "selectedTherapistHistory.$.current": false,
            "selectedTherapistHistory.$.endDate": new Date(),
          },
        },
        { session }
      );

      // Remove client from old therapist's assignedClients list
      await User.findByIdAndUpdate(
        client.selectedTherapist.therapist,
        { $pull: { assignedClients: clientId } },
        { session }
      );

      // Add new therapist to selectedTherapistHistory
      await User.findByIdAndUpdate(
        clientId,
        {
          $set: {
            "selectedTherapist.therapist": therapistId,
          },
          $push: {
            selectedTherapistHistory: {
              therapist: therapistId,
              startDate: new Date(),
              current: true,
            },
          },
        },
        { session }
      );
    }

    // Add client to new therapist's assignedClients list if not already present
    const assignedClientIds = therapist?.assignedClients?.map(
      (assignedClientId: any) => assignedClientId.toString()
    );

    if (!assignedClientIds?.includes(clientId)) {
      await User.findByIdAndUpdate(
        therapistId,
        { $addToSet: { assignedClients: clientId } }, // $addToSet ensures no duplicates
        { session }
      );
    }

    // Update the clients appointments
    await updateAppointments(
      clientId,
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

    const clientTimeZone = client?.settings?.timeZone || "UTC";
    const therapistTimeZone = therapist?.settings?.timeZone || "UTC";

    const clientAppointmentDate = formatInTimeZone(
      new Date(appointment[0].startDate),
      clientTimeZone,
      "yyyy-MM-dd"
    );

    const clientAppointmentTime = formatInTimeZone(
      new Date(appointment[0].startDate),
      clientTimeZone,
      "HH:mm"
    );

    const therapistAppointmentDate = formatInTimeZone(
      new Date(appointment[0].startDate),
      therapistTimeZone,
      "yyyy-MM-dd"
    );

    const therapistAppointmentTime = formatInTimeZone(
      new Date(appointment[0].startDate),
      therapistTimeZone,
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
      date: new Date(appointment[0].startDate),
      clientName: `${await getFullName(client.firstName, client.lastName)}`,
      appointmentId: appointmentId,
      appointmentTypeId: appointmentTypeId,
    };

    await sendNonPaidBookingConfirmationEmail(
      therapist.email,
      client.email,
      appointmentDetails
    );

    return {
      appointmentId,
      success: SuccessMessages("appointmentCreated"),
    };
  } catch (error) {
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Error booking appointment:", error);

    return { error: ErrorMessages("somethingWentWrong") };
  }
};
