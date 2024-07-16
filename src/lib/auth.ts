import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { UserRole } from "@/generalTypes";

export const getCurrentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const getCurrentRole = async () => {
  const session = await auth();

  return {
    role: session?.user?.role,
    isTherapist: session?.user?.role === "THERAPIST",
    isPatient: session?.user?.role === "CLIENT",
  };
};

const verifyUserSession = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  return dbUser;
};

export const requireAuth = async (requiredRoles: UserRole[]) => {
  const user = await verifyUserSession();

  if (!requiredRoles.includes(user.role) && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
};
