"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  if (!token) {
    return { error: ErrorMessages("missingToken") };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: ErrorMessages("invalidToken") };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: ErrorMessages("tokenHasExpired") };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: ErrorMessages("emailNotExist") };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(existingUser._id, {
    password: hashedPassword,
  });

  await PasswordResetToken.findByIdAndDelete(existingToken._id);

  return {
    success: SuccessMessages("passwordUpdated"),
  };
};
