import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

export const getAppointments = async () => {
  const user = await requireAuth([UserRole.THERAPIST, UserRole.CLIENT]);
  const dbUser = (await User.findById(user.id).lean()) as any;
  if (!dbUser || !dbUser.appointments || dbUser.appointments.length === 0) {
    return null;
  }

  const appointments = await Appointment.find({
    _id: { $in: dbUser.appointments },
  })
    .lean()
    .populate("participants", "firstName lastName email")
    .populate("hostUserId", "firstName lastName email");
  const serializedAppointments = appointments?.map((appointment: any) => ({
    ...appointment,
    participants: appointment.participants.map((participant: any) => ({
      ...participant,
      _id: participant._id.toString(),
    })),
    _id: appointment._id.toString(),
    hostUserId: {
      ...appointment.hostUserId,
      _id: appointment.hostUserId._id.toString(),
    },
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  })) as any;

  return serializedAppointments;
};
