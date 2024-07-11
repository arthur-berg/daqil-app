"use server";
import * as z from "zod";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import { AppointmentSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { Types } from "mongoose";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";

export const getAppointments = async () => {
  await requireAuth([UserRole.THERAPIST]);

  const user = await getCurrentUser();

  const appointments = await Appointment.find({
    therapistId: user?.id,
  }).lean();

  const serializedAppointments = appointments.map((appointment: any) => ({
    ...appointment,
    _id: appointment._id.toString(),
    therapistId: appointment.therapistId.toString(),
    patientId: appointment.patientId.toString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  })) as any;

  return serializedAppointments;
};

export const getPatients = async () => {
  await requireAuth([UserRole.THERAPIST]);

  const patients = await User.find({ role: UserRole.USER });

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

  const { title, description, startDate, endDate, paid, status, patientId } =
    validatedFields.data;

  await Appointment.create({
    title,
    description,
    startDate,
    endDate,
    paid,
    status,
    patientId: patientId,
    therapistId: user.id,
  });

  return { success: "Appointment successfully created" };

  /*   await Appointment.create({}); */
};
