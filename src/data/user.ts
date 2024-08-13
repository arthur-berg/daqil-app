import { UserRole } from "@/generalTypes";
import User from "@/models/User";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await User.findById(id);

    return user;
  } catch {
    return null;
  }
};

export const getClients = async (therapistId: string) => {
  try {
    const therapist = await User.findById(therapistId).populate({
      path: "assignedClients",
      select: "firstName lastName email appointments",
    });

    if (therapist) {
      const clientsWithAppointmentCounts = therapist.assignedClients.map(
        (client: any) => {
          return {
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            totalAppointments: client.appointments.length, // Counting the number of appointments
          };
        }
      ) as any;

      return clientsWithAppointmentCounts;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

export const getTherapistById = async (id: string) => {
  try {
    const therapist = await User.findById(id).populate(
      "appointments.bookedAppointments"
    );

    return therapist;
  } catch {
    return null;
  }
};

//emailVerified: { $ne: null },

export const getTherapists = async () => {
  try {
    const therapists = await User.find({
      role: UserRole.THERAPIST,
    }).lean();

    return therapists;
  } catch {
    return null;
  }
};
