"use server";
import * as z from "zod";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import { AppointmentSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { Types } from "mongoose";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { getAppointmentTypeById } from "@/data/appointment-types";

export const getAppointments = async () => {
  await requireAuth([UserRole.THERAPIST]);

  const user = await getCurrentUser();

  const appointments = await Appointment.find({
    hostUserId: user?.id,
  }).lean();

  const serializedAppointments = appointments.map((appointment: any) => ({
    ...appointment,
    _id: appointment._id.toString(),
    hostUserId: appointment.hostUserId.toString(),
    participants: appointment.participants.map((participant: any) =>
      participant.userId.toString()
    ),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  })) as any;

  return serializedAppointments;
};

export const getPatients = async () => {
  await requireAuth([UserRole.THERAPIST]);

  const patients = await User.find({ role: UserRole.CLIENT }).lean();

  console.log("patients", patients);

  return patients;
};

export const createAppointment = async (
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
    patientId,
    appointmentTypeId,
  } = validatedFields.data;

  const appointmentType = await getAppointmentTypeById(appointmentTypeId);

  if (!appointmentType) {
    return { error: "Invalid appointment type" };
  }

  let appointmentCost = {};

  if ("price" in appointmentType) {
    appointmentCost = {
      price: appointmentType.price,
      currency: appointmentType.currency,
    };
  }
  if ("credits" in appointmentType) {
    appointmentCost = { credits: appointmentType.credits };
  }

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  console.log("startDate", startDate);
  console.log("endDate", endDate);

  await Appointment.create({
    title,
    description,
    startDate,
    endDate,
    paid,
    status,
    participants: [{ userId: patientId }],
    hostUserId: user.id,
    durationInMinutes: appointmentType.durationInMinutes,
    ...appointmentCost,
  });

  return { success: "Appointment successfully created" };
};
