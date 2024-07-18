import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";

import VerificationToken from "@/models/VerificationToken";
import PasswordResetToken from "@/models/PasswordResetToken";
import TwoFactorToken from "@/models/TwoFactorToken";

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();

  const expires = new Date(new Date().getTime() + 10 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await TwoFactorToken.findByIdAndDelete(existingToken._id);
  }

  const twoFactorToken = await TwoFactorToken.create({
    email,
    token,
    expires,
  });

  return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    await PasswordResetToken.findByIdAndDelete(existingToken._id);
  }

  const passwordResetToken = await PasswordResetToken.create({
    email,
    token,
    expires,
  });

  return passwordResetToken;
};

export const generateVerificationToken = async (
  email: string,
  expiresInHours: number = 1
) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + expiresInHours * 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await VerificationToken.findByIdAndDelete(existingToken._id);
  }

  const verificationToken = await VerificationToken.create({
    email,
    token,
    expires,
  });

  return verificationToken;
};
