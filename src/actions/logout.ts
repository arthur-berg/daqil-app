"use server";

import { signOut } from "@/auth";
import { getLocale } from "next-intl/server";

export const logout = async () => {
  const locale = await getLocale();

  // some server stuff
  console.log("locale", locale);
  await signOut({ redirectTo: `/${locale}/auth/login` });
};
