"use server";

import { signOut } from "@/auth";
import { getLocale } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

export const logout = async () => {
  await connectToMongoDB();
  const locale = await getLocale();

  await signOut({ redirectTo: `/${locale}/auth/login` });
};
