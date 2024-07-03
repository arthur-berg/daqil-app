"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { SetupAccountSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { login } from "@/actions/login";

export const setupAccount = async (
  values: z.infer<typeof SetupAccountSchema>
) => {
  const validatedFields = SetupAccountSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, currentPassword } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const passwordsMatch = await bcrypt.compare(
    currentPassword,
    existingUser.password
  );

  if (!passwordsMatch) {
    return { error: "Incorrect password!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(existingUser._id, {
    password: hashedPassword,
    isAccountSetupDone: true,
    name,
  });

  await login({ email, password });

  return { success: "Account succesfully setup" };
};
