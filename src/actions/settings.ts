"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";

import { SettingsSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

export const settings = async (values: z.input<typeof SettingsSchema>) => {
  await connectToMongoDB();
  const user = await getCurrentUser();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  if (!user) {
    return { error: ErrorMessages("unauthorized") };
  }

  const dbUser = (await getUserById(user.id)) as any;

  if (!dbUser) {
    return { error: ErrorMessages("unauthorized") };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: ErrorMessages("emailAlreadyInUse") };
    }

    const verificationToken = await generateVerificationToken(values.email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: SuccessMessages("verificationEmailSent") };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password
    );

    if (!passwordsMatch) {
      return { error: ErrorMessages("incorrectPassword") };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);

    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updateData: any = {
    ...values,
    settings: {
      ...dbUser.settings,
      ...values.settings,
    },
  };

  await User.findByIdAndUpdate(dbUser.id, updateData);

  return { success: SuccessMessages("settingsUpdated") };
};
