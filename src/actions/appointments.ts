"use server";
import * as z from "zod";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import { AppointmentSchema, CancelAppointmentSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import mongoose from "mongoose";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { scheduleJobToCheckAppointmentStatus } from "@/lib/schedulerJobs";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import {
  sendAppointmentBookingConfirmationEmail,
  sendAppointmentCancellationEmail,
} from "@/lib/mail";

export const getClients = async () => {
  await requireAuth([UserRole.THERAPIST]);

  const clients = await User.find({ role: UserRole.CLIENT }).lean();

  return clients;
};

const createAppointment = async (appointmentData: any, session: any) => {
  const appointment = await Appointment.create([appointmentData], { session });
  const appointmentItem = appointment[0]; // As appointment.create returns an array

  scheduleJobToCheckAppointmentStatus(
    appointmentItem._id,
    appointmentItem.endDate
  );

  return appointment;
};

const updateAppointments = async (
  userId: string,
  appointmentDate: string,
  appointmentId: string,
  session: any
) => {
  // First, check if the date entry exists
  const user = await User.findOne(
    {
      _id: userId,
      "appointments.date": appointmentDate,
    },
    null, // Projection, keep it null
    { session }
  );

  if (user) {
    // If the date exists, update the bookedAppointments array
    await User.findOneAndUpdate(
      {
        _id: userId,
        "appointments.date": appointmentDate, // Match the specific date
      },
      {
        $push: {
          "appointments.$.bookedAppointments": appointmentId, // Push to the existing array for that date
        },
      },
      { session }
    );
  } else {
    // If the date doesn't exist, add a new date entry with the appointmentId
    await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $push: {
          appointments: {
            date: appointmentDate,
            bookedAppointments: [appointmentId],
          },
        },
      },
      { session }
    );
  }
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
        user.id === appointment.hostUserId.toString() ||
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

    console.log("appointmentDetails", appointmentDetails);

    await sendAppointmentCancellationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    revalidatePath("/therapist/appointments");

    return { success: SuccessMessages("appointmentCancelled") };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

export const bookAppointment = async (
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
      paid: false,
      status: "confirmed",
      credits: appointmentType.credits,
    };

    const appointment = await createAppointment(appointmentData, session);
    const appointmentId = appointment[0]._id; // As appointment.create returns an array
    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    // Handle therapist change
    if (
      client.selectedTherapist &&
      client.selectedTherapist.toString() !== therapistId
    ) {
      // Remove client from old therapist's assignedClients list
      await User.findByIdAndUpdate(
        client.selectedTherapist,
        { $pull: { assignedClients: client.id } },
        { session }
      );

      // Update or set the client's selected therapist
      await User.findByIdAndUpdate(
        client.id,
        { selectedTherapist: therapistId },
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
      session
    );

    // Update the therapist's appointments
    await updateAppointments(
      therapistId,
      appointmentDate,
      appointmentId,
      session
    );

    await session.commitTransaction();
    session.endSession();

    const therapistEmail = therapist.email;
    const clientEmail = client.email;
    const appointmentDetails = {
      date: format(startDate, "yyyy-MM-dd"),
      time: format(startDate, "HH:mm"),
      therapistName: `${therapist.firstName} ${therapist.lastName}`,
      clientName: `${client.firstName} ${client.lastName}`,
    };

    await sendAppointmentBookingConfirmationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    revalidatePath("/client/appointments");

    return { success: SuccessMessages("appointmentBooked") };
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
          paid,
          status,
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
      // Remove client from old therapist's assignedClients list
      await User.findByIdAndUpdate(
        client.selectedTherapist,
        { $pull: { assignedClients: client.id } },
        { session }
      );

      // Update or set the client's selected therapist
      await User.findByIdAndUpdate(
        clientId,
        { selectedTherapist: therapist.id },
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
    await updateAppointments(clientId, appointmentDate, appointmentId, session);

    // Update the therapist's appointments
    await updateAppointments(
      therapist.id,
      appointmentDate,
      appointmentId,
      session
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
