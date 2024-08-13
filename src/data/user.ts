import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { ExtendedUser } from "@/next-auth";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });

    return user;
  } catch {
    return null;
  }
};

export const getSelectedTherapist = async (selectedTherapistId: string) => {
  try {
    const therapist = await User.findById(selectedTherapistId).lean();

    return therapist;
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
