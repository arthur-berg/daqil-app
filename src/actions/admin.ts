"use server";

import { UserRole } from "@/generalTypes";
import { getCurrentRole } from "@/lib/auth";

export const admin = async () => {
  const { role } = await getCurrentRole();

  if (role === UserRole.ADMIN) {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
};
