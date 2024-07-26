"use server";

import VerificationToken from "@/models/VerificationToken";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";

export const newVerification = async (token: string) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: ErrorMessages("tokenNotExist") };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: ErrorMessages("tokenHasExpired") };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: ErrorMessages("emailNotExist") };
  }

  await User.findByIdAndUpdate(existingUser._id, {
    emailVerified: new Date(),
    email: existingToken.email,
  });

  return {
    success: SuccessMessages("emailVerified"),
    email: existingToken.email,
  };
};
