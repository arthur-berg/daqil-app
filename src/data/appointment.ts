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

export const getAppointments = async () => {
  const user = await requireAuth([UserRole.THERAPIST, UserRole.CLIENT]);
  const dbUser = (await User.findById(user.id).lean()) as any;
  if (!dbUser || !dbUser.appointments || dbUser.appointments.length === 0) {
    return null;
  }

  const appointmentIds = dbUser.appointments
    .map((appointment: any) => appointment.bookedAppointments)
    .flat();

  const appointments = await Appointment.find({
    _id: { $in: appointmentIds },
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
