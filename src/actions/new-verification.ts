"use server";

import VerificationToken from "@/models/VerificationToken";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import User from "@/models/User";

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await User.findByIdAndUpdate(existingUser._id, {
    emailVerified: new Date(),
    email: existingToken.email,
  });

  return { success: "Email verified!", email: existingToken.email };
};
