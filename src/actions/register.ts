"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { addUserToSubscriberList, sendVerificationEmail } from "@/lib/mail";
import { generatePassword } from "@/utils";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      error:
        "Please check your input. If you believe you already have an account, please try logging in or use the password recovery option.",
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
    success:
      "A link to activate your account has been emailed to the address provided",
  };
};
