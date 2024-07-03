"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { SetupAccountSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { login } from "@/actions/login";
import { getVerificationTokenByToken } from "@/data/verification-token";
import VerificationToken from "@/models/VerificationToken";

const verifyPasswordAndLogin = async ({
  existingUser,
  currentPassword,
  hashedPassword,
  name,
  email,
  password,
}: {
  existingUser: any;
  currentPassword?: string;
  hashedPassword: string;
  name: string;
  email: string;
  password: string;
}) => {
  if (!currentPassword) {
    return {
      error: "Current password is required!",
      currentPasswordRequired: true,
    };
  }

  const passwordsMatch = await bcrypt.compare(
    currentPassword,
    existingUser.password
  );
  if (!passwordsMatch) {
    return { error: "Incorrect password!" };
  }
  await User.findByIdAndUpdate(existingUser._id, {
    password: hashedPassword,
    isAccountSetupDone: true,
    name,
  });

  await login({ email, password });

  return { success: "Account successfully setup" };
};

export const setupAccount = async (
  values: z.infer<typeof SetupAccountSchema>,
  token?: string | null
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

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!token) {
    return await verifyPasswordAndLogin({
      existingUser,
      currentPassword,
      hashedPassword,
      name,
      email,
      password,
    });
  }

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return await verifyPasswordAndLogin({
      existingUser,
      currentPassword,
      hashedPassword,
      name,
      email,
      password,
    });
  }

  await User.findByIdAndUpdate(existingUser._id, {
    password: hashedPassword,
    isAccountSetupDone: true,
    name,
  });

  await VerificationToken.findByIdAndDelete(existingToken._id);

  await login({ email, password });

  return { success: "Account succesfully setup" };
};
