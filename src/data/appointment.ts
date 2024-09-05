import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

const getStructuredParticipantData = (appointment: any) => {
  const transformedParticipants = appointment.participants.map(
    (participant: any) => ({
      firstName: participant.userId.firstName,
      lastName: participant.userId.lastName,
      email: participant.userId.email,
      userId: participant.userId._id.toString(),
      showUp: participant.showUp,
    })
  );

  return transformedParticipants;
};

export const getAppointmentByIdWithPolling = async (id: string) => {
  const maxAttempts = 5;
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const appointment = (await Appointment.findById(id).lean().exec()) as any;

    if (appointment && appointment.amountPaid) {
      return appointment;
    }

    await delay(2000); // Wait 2 seconds before trying again
  }

  // If it still doesn't have amountPaid, return whatever was last fetched
  return Appointment.findById(id).lean().exec();
};
export const getAppointmentById = async (id: string) => {
  try {
    const appointment = await Appointment.findById(id);

    return appointment;
  } catch {
    return null;
  }
};

export const getAppointments = async () => {
  const user = await requireAuth([UserRole.THERAPIST, UserRole.CLIENT]);
  const dbUser = (await User.findById(user.id).lean()) as any;
  if (!dbUser || !dbUser.appointments || dbUser.appointments.length === 0) {
    return [];
  }

  const appointmentIds = dbUser.appointments
    .map((appointment: any) => appointment.bookedAppointments)
    .flat();

  const appointments = await Appointment.find({
    _id: { $in: appointmentIds },
    status: { $ne: "temporarily-reserved" },
  })
    .lean()
    .populate({
      path: "participants.userId",
      select: "firstName lastName email",
    })
    .populate("hostUserId", "firstName lastName email");

  const serializedAppointments = appointments?.map((appointment: any) => ({
    ...appointment,
    _id: appointment._id.toString(),
    participants: getStructuredParticipantData(appointment),
    hostUserId: {
      ...appointment.hostUserId,
      _id: appointment.hostUserId._id.toString(),
    },
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  })) as any;

  return serializedAppointments;
};
