"use server";
import * as z from "zod";
import { requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import { AppointmentSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import mongoose, { Types } from "mongoose";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { scheduleJobToCheckAppointmentStatus } from "@/lib/schedulerJobs";
import { revalidatePath } from "next/cache";

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

export const bookAppointment = async (
  appointmentType: any,
  therapistId: string,
  startDate: Date
) => {
  const user = await requireAuth([UserRole.CLIENT, UserRole.ADMIN]);

  const therapist = (await getUserById(therapistId)) as any;

  if (!therapist) {
    return { error: "Invalid therapist" };
  }

  if (!appointmentType) {
    return { error: "Invalid appointment type" };
  }

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointmentData = {
      title: `Therapy session with ${therapist?.firstName}`,
      startDate,
      endDate,
      participants: [{ userId: user.id, showUp: false }],
      hostUserId: therapistId,
      durationInMinutes: appointmentType.durationInMinutes,
      paid: false,
      status: "confirmed",
      credits: appointmentType.credits,
    };

    const appointment = await createAppointment(appointmentData, session);

    const appointmentId = appointment[0]._id; // As appointment.create returns an array

    // Update the user who booked the appointment
    await User.findByIdAndUpdate(
      user.id,
      {
        $push: { appointments: appointmentId },
      },
      { session }
    );

    // Update the therapist
    await User.findByIdAndUpdate(
      therapistId,
      {
        $push: { appointments: appointmentId },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    revalidatePath("/client/appointments");

    return { success: "Appointment successfully booked" };
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
  const user = await requireAuth([UserRole.THERAPIST]);

  const validatedFields = AppointmentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
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

  if (!appointmentType) {
    return { error: "Invalid appointment type" };
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
          hostUserId: user.id,
          durationInMinutes: appointmentType.durationInMinutes,
          ...appointmentCost,
        },
      ],
      { session }
    );

    const appointmentId = appointment[0]._id;

    await User.findByIdAndUpdate(
      clientId,
      {
        $push: { appointments: appointmentId },
      },
      { session }
    );

    await User.findByIdAndUpdate(
      user.id,
      {
        $push: { appointments: appointmentId },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { success: "Appointment successfully created" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error booking appointment:", error);
    throw error;
  }
};
