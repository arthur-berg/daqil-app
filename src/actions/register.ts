"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { addUserToSubscriberList, sendVerificationEmail } from "@/lib/mail";
import { generatePassword } from "@/utils";
import { getTranslations } from "next-intl/server";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      error: ErrorMessages("pleaseCheckInput"),
    };
  }

  const password = generatePassword();

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    password: hashedPassword,
    email,
  });

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token,
    password
  );

  await addUserToSubscriberList(verificationToken.email);
  /*  if (response?.error) {
    return { error: "Something went wrong" };
  } */

  return {
    success: SuccessMessages("linkToActive"),
  };
};
