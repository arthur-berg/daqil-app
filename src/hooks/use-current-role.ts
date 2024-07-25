import { useSession } from "next-auth/react";

export const useCurrentRole = () => {
  const session = useSession();

  return {
    role: session?.data?.user?.role,
    isTherapist: session?.data?.user?.role === "THERAPIST",
    isAdmin: session?.data?.user?.role === "ADMIN",
    isClient: session?.data?.user?.role === "CLIENT",
  };
};
