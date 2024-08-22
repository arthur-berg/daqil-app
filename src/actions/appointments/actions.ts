"use server";
import * as z from "zod";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import { AppointmentSchema, CancelAppointmentSchema } from "@/schemas";
import { getTherapistById, getUserById } from "@/data/user";
import mongoose from "mongoose";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import {
  sendAppointmentCancellationEmail,
  sendNonPaidBookingConfirmationEmail,
} from "@/lib/mail";
import {
  checkTherapistAvailability,
  clearTemporarilyReservedAppointments,
  createAppointment,
  updateAppointments,
} from "./utils";

export const getClients = async () => {
  await requireAuth([UserRole.THERAPIST]);

  const clients = await User.find({ role: UserRole.CLIENT }).lean();

  return clients;
};

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

    await sendAppointmentCancellationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    revalidatePath("/therapist/appointments");

    return { success: SuccessMessages("appointmentCanceled") };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

// The function that handles the "Pay Later" logic
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

  const client = await requireAuth([UserRole.CLIENT, UserRole.ADMIN]);

  const therapist = await getUserById(therapistId);

  if (!therapist) {
    return { error: ErrorMessages("therapistNotExist") };
  }

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
        "appointments.temporarilyReservedAppointments": appointmentId,
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
        "appointments.temporarilyReservedAppointments": appointmentId,
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

    return { success: SuccessMessages("bookingConfirmed") };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error confirming appointment:", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};

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

  const therapist = (await getUserById(therapistId)) as any;

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
    endDate
  );

  if (!availabilityCheck.available) {
    return { error: availabilityCheck.message };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointmentData = {
      title: `${t("therapySessionWith")} ${therapist?.firstName}`,
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
      credits: appointmentType.credits,
      price: appointmentType.price,
      currency: appointmentType.currency,
    };

    const appointment = await createAppointment(appointmentData, session);
    const appointmentId = appointment[0]._id;
    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    if (
      !client.selectedTherapist ||
      client.selectedTherapist?.toString() !== therapistId
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

      // Add new therapist to selectedTherapistHistory
      await User.findByIdAndUpdate(
        client.id,
        {
          selectedTherapist: therapistId,
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
        client.selectedTherapist,
        { $pull: { assignedClients: client.id } },
        { session }
      );
    }

    // Add client to new therapist's assignedClients list if not already present
    if (!therapist.assignedClients.includes(client.id)) {
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
    session.endSession();

    revalidatePath("/appointments");

    return {
      success: SuccessMessages("appointmentReserved"),
      appointmentId: appointmentId,
      paymentExpiryDate: appointment[0].payment.paymentExpiryDate,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error booking appointment:", error);
    throw error;
  }
};

export const scheduleAppointment = async (
  values: z.input<typeof AppointmentSchema>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const therapist = await requireAuth([UserRole.THERAPIST]);

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

  let appointmentCost: Record<string, unknown> = {};

  if ("price" in appointmentType) {
    appointmentCost.price = appointmentType.price;
    appointmentCost.currency = appointmentType.currency;
  }
  if ("credits" in appointmentType) {
    appointmentCost.credits = appointmentType.credits;
    appointmentCost.price = appointmentType.price;
  }

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.create(
      [
        {
          title,
          description,
          startDate,
          endDate,
          payment: {
            method: "payAfterBooking",
            status: "pending",
          },
          status: "confirmed",
          participants: [{ userId: clientId, showUp: false }],
          hostUserId: therapist.id,
          durationInMinutes: appointmentType.durationInMinutes,
          ...appointmentCost,
        },
      ],
      { session }
    );

    const appointmentId = appointment[0]._id;

    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    // Check and update client's selected therapist

    if (
      client.selectedTherapist &&
      client.selectedTherapist.toString() !== therapist.id
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
        client.selectedTherapist,
        { $pull: { assignedClients: client.id } },
        { session }
      );

      // Add new therapist to selectedTherapistHistory
      await User.findByIdAndUpdate(
        clientId,
        {
          selectedTherapist: therapist.id,
          $push: {
            selectedTherapistHistory: {
              therapist: therapist.id,
              startDate: new Date(),
              current: true,
            },
          },
        },
        { session }
      );
    }

    // Add client to new therapist's assignedClients list if not already present
    if (!therapist?.assignedClients?.includes(clientId)) {
      await User.findByIdAndUpdate(
        therapist.id,
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
      therapist.id,
      appointmentDate,
      appointmentId,
      session,
      "bookedAppointments"
    );

    await session.commitTransaction();
    session.endSession();

    return { success: SuccessMessages("appointmentCreated") };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error booking appointment:", error);
    throw error;
  }
};
