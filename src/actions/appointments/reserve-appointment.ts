"use server";

import { UserRole } from "./../../generalTypes";
import { getTherapistById } from "@/data/user";
import { requireAuth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
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
import { getFirstName } from "@/utils/formatName";

export const reserveAppointment = async (
  appointmentType: any,
  therapistId: string,
  startDate: Date
) => {
  const [SuccessMessages, ErrorMessages, t] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
    getTranslations("AppointmentAction"),
  ]);
  const client = await requireAuth([UserRole.CLIENT, UserRole.ADMIN]);

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
      title: `${t("therapySessionWith")} ${await getFirstName(
        therapist?.firstName
      )}`,
      startDate,
      endDate,
      participants: [{ userId: client.id, showUp: false }],
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

    if (
      !client.selectedTherapist ||
      client.selectedTherapist?.therapist?.toString() !== therapistId
    ) {
      // Update the previous therapist in selectedTherapistHistory
      await User.updateOne(
        { _id: client.id, "selectedTherapistHistory.current": true },
        {
          $set: {
            "selectedTherapistHistory.$.current": false,
            "selectedTherapistHistory.$.endDate": new Date(),
          },
        },
        { session }
      );

      await User.findByIdAndUpdate(
        client.id,
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

      // Remove client from old therapist's assignedClients list
      await User.findByIdAndUpdate(
        client.selectedTherapist?.therapist,
        { $pull: { assignedClients: client.id } },
        { session }
      );
    }

    // Add client to new therapist's assignedClients list if not already present
    if (!therapist.assignedClients?.includes(client.id)) {
      await User.findByIdAndUpdate(
        therapistId,
        { $addToSet: { assignedClients: client.id } }, // $addToSet ensures no duplicates
        { session }
      );
    }

    // Update the user's appointments
    await updateAppointments(
      client.id,
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

    revalidatePath("/appointments");

    return {
      success: SuccessMessages("appointmentReserved"),
      appointmentId: appointmentId,
      paymentExpiryDate: appointment[0].payment.paymentExpiryDate,
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
