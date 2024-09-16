"use server";

import { signOut } from "@/auth";
import { getLocale } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { redirect } from "@/navigation";

export const logout = async () => {
  await connectToMongoDB();
  const locale = await getLocale();

  await signOut({ redirect: false });
  redirect("/auth/login");
};
