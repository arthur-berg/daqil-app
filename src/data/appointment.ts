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

export const getAppointmentById = async (id: string) => {
  try {
    const appointment = await Appointment.findById(id);

    return appointment;
  } catch {
    return null;
  }
};

export const getUserWithAppointments = async (userId: string) => {
  return User.findById(userId, "appointments").lean();
};

export const getSerializedAppointments = async (appointments: any[]) => {
  const appointmentIds = appointments
    .map((appointment) => appointment.bookedAppointments)
    .flat();

  const populatedAppointments = await Appointment.find({
    _id: { $in: appointmentIds },
    status: { $ne: "temporarily-reserved" },
  })
    .lean()
    .populate({
      path: "participants.userId",
      select: "firstName lastName email",
    })
    .populate("hostUserId", "firstName lastName email");

  return populatedAppointments.map((appointment: any) => ({
    ...appointment,
    _id: appointment._id.toString(),
    participants: getStructuredParticipantData(appointment),
    hostUserId: {
      ...appointment.hostUserId,
      _id: appointment.hostUserId._id.toString(),
    },
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  }));
};

export const getAppointments = async () => {
  const user = await requireAuth([UserRole.THERAPIST, UserRole.CLIENT]);
  const dbUser = (await getUserWithAppointments(user.id)) as any;

  if (!dbUser || dbUser.appointments.length === 0) {
    return [];
  }

  return await getSerializedAppointments(dbUser.appointments);
};
