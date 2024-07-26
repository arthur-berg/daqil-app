"use server";

import { signOut } from "@/auth";
import { getLocale } from "next-intl/server";

export const logout = async () => {
  const locale = await getLocale();

  await signOut({ redirectTo: `/${locale}/auth/login` });
};
