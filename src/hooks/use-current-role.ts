import { useMemo } from "react";
import { useSession } from "next-auth/react";

export const useCurrentRole = () => {
  const { data } = useSession();

  const roleData = useMemo(() => {
    return {
      role: data?.user?.role,
      isTherapist: data?.user?.role === "THERAPIST",
      isAdmin: data?.user?.role === "ADMIN",
      isClient: data?.user?.role === "CLIENT",
    };
  }, [data]);

  return roleData;
};
