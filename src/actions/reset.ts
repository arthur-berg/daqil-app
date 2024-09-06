"use server";

import * as z from "zod";

import { ResetSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidEmail") };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: ErrorMessages("emailNotFound") };
  }

  const passwordResetToken = await generatePasswordResetToken(email);

  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: SuccessMessages("resetEmailSent") };
};
