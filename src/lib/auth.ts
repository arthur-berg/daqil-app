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
    isAdmin: session?.user?.role === "ADMIN",
    isClient: session?.user?.role === "CLIENT",
  };
};

const verifyUserSession = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("userNotFound");
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    throw new Error("userNotFound");
  }

  return user;
};

export const requireAuth = async (requiredRoles: UserRole[]) => {
  const user = await verifyUserSession();

  if (!requiredRoles.includes(user.role) && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
};
