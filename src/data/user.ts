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

export const getUserById = async (id: string) => {
  try {
    const user = (await User.findById(id).lean()) as ExtendedUser;

    return user;
  } catch {
    return null;
  }
};

export const getTherapists = async () => {
  try {
    const therapists = await User.find({ role: UserRole.THERAPIST }).lean();

    return therapists;
  } catch {
    return null;
  }
};
