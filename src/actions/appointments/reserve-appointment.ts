"use server";

import { UserRole } from "./../../generalTypes";
import {
  getClientByIdAppointments,
  getTherapistById,
  getUserByIdLean,
} from "@/data/user";
import { requireAuth } from "@/lib/auth";
import { getLocale, getTranslations } from "next-intl/server";
import {
  checkTherapistAvailability,
  clearTemporarilyReservedAppointments,
  createAppointment,
  updateAppointments,
} from "./utils";
import { format } from "date-fns";
import mongoose from "mongoose";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import connectToMongoDB from "@/lib/mongoose";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { sendIntroBookingConfirmationMailWithLink } from "@/lib/mail";
import { getFullName } from "@/utils/formatName";

export const reserveAppointment = async (
  appointmentType: any,
  therapistId: string,
  startDate: Date
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages, t, tAppointmentTypes] =
    await Promise.all([
      getTranslations("SuccessMessages"),
      getTranslations("ErrorMessages"),
      getTranslations("AppointmentAction"),
      getTranslations("AppointmentTypes"),
    ]);
  const user = await requireAuth([UserRole.CLIENT, UserRole.ADMIN]);

  const client = (await getClientByIdAppointments(user.id)) as any;
  const clientId = client._id.toString();

  const therapist = (await getTherapistById(therapistId)) as any;

  if (!therapist) {
    return { error: ErrorMessages("therapistNotExist") };
  }

  if (!appointmentType) {
    return { error: ErrorMessages("appointmentTypeNotExist") };
  }

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  // Clear any temporarily reserved appointments before the transaction
  await clearTemporarilyReservedAppointments(
    client,
    therapist,
    format(new Date(startDate), "yyyy-MM-dd")
  );

  // Check for overlapping appointments before starting the transaction
  const availabilityCheck = await checkTherapistAvailability(
    therapist,
    startDate,
    endDate,
    appointmentType
  );

  if (!availabilityCheck.available) {
    return { error: availabilityCheck.message };
  }

  let transactionCommitted = false;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointmentData = {
      title: `${tAppointmentTypes(appointmentType._id)}`,
      startDate,
      endDate,
      participants: [{ userId: clientId, showUp: false }],
      hostUserId: therapistId,
      durationInMinutes: appointmentType.durationInMinutes,
      payment: {
        method: "payBeforeBooking",
        status: "pending",
        paymentExpiryDate: new Date(Date.now() + 15 * 60000),
      },
      status: "temporarily-reserved",
      price: appointmentType.price,
      currency: appointmentType.currency,
      appointmentTypeId: appointmentType._id,
    };

    const appointment = await createAppointment(appointmentData, session);
    const appointmentId = appointment[0]._id;
    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    const isIntroCall =
      appointmentType._id.toString() === APPOINTMENT_TYPE_ID_INTRO_SESSION;

    // Update the user's appointments
    await updateAppointments(
      clientId,
      appointmentDate,
      appointmentId,
      session,
      "temporarilyReservedAppointments"
    );

    // Update the therapist's appointments
    await updateAppointments(
      therapistId,
      appointmentDate,
      appointmentId,
      session,
      "temporarilyReservedAppointments"
    );

    await session.commitTransaction();
    transactionCommitted = true;
    session.endSession();

    if (isIntroCall) {
      const locale = await getLocale();
      const appointmentDetails = {
        appointmentId: appointmentId.toString(),
        clientDate: format(new Date(startDate), "yyyy-MM-dd"),
        clientTime: format(new Date(startDate), "HH:mm"),
        therapistDate: format(new Date(startDate), "yyyy-MM-dd"),
        therapistTime: format(new Date(startDate), "HH:mm"),
        therapistName: `${await getFullName(
          therapist.firstName,
          therapist.lastName
        )}`,
        clientName: `${await getFullName(client.firstName, client.lastName)}`,
        durationInMinutes: appointmentType.durationInMinutes,
        clientTimeZone: client.settings.timeZone,
        therapistTimeZone: therapist.settings.timeZone,
      };

      await sendIntroBookingConfirmationMailWithLink(
        therapist.email,
        client.email,
        appointmentDetails,
        locale
      );
    }

    revalidatePath("/appointments");

    return {
      success: SuccessMessages("appointmentReserved"),
      appointmentId: appointmentId.toString(),
      paymentExpiryDate: appointment[0].payment.paymentExpiryDate.toISOString(),
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
