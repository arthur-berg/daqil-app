"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { SetupAccountSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { login } from "@/actions/login";
import { getVerificationTokenByToken } from "@/data/verification-token";
import VerificationToken from "@/models/VerificationToken";
import { addUserNameToSubscriberProfile } from "@/lib/mail";
import { getLocale } from "next-intl/server";

const verifyPasswordAndLogin = async ({
  existingUser,
  currentPassword,
  hashedPassword,
  firstName,
  lastName,
  email,
  password,
  locale,
}: {
  existingUser: any;
  currentPassword?: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  locale: string;
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
    firstName,
    lastName,
  });

  await login({ email, password }, locale);

  return { success: "Account successfully setup" };
};

export const setupAccount = async (
  values: z.infer<typeof SetupAccountSchema>,
  locale: string,
  token?: string | null
) => {
  const validatedFields = SetupAccountSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { email, password, firstName, lastName, currentPassword } =
    validatedFields.data;

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
      firstName,
      lastName,
      email,
      password,
      locale,
    });
  }

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return await verifyPasswordAndLogin({
      existingUser,
      currentPassword,
      hashedPassword,
      firstName,
      lastName,
      email,
      password,
      locale,
    });
  }

  await User.findByIdAndUpdate(existingUser._id, {
    password: hashedPassword,
    isAccountSetupDone: true,
    firstName,
    lastName,
  });

  await VerificationToken.findByIdAndDelete(existingToken._id);

  await addUserNameToSubscriberProfile(email, firstName, lastName);

  await login({ email, password }, locale);

  return { success: "Account succesfully setup" };
};
