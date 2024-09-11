"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from "@/lib/tokens";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import TwoFactorToken from "@/models/TwoFactorToken";
import TwoFactorConfirmation from "@/models/TwoFactorConfirmation";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  locale: string,
  callbackUrl?: string | null,
  verifyAccountSetup?: boolean
) => {
  await connectToMongoDB();

  const validatedFields = LoginSchema.safeParse(values);
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  /* if (verifyAccountSetup) {
    const { email } = validatedFields.data;
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return { error: "Email does not exist" };
    }
    if (!existingUser.emailVerified) {
      const verificationToken = await generateVerificationToken(
        existingUser.email
      );
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );

      return {
        success: verificationToken.email,
        verificationEmailSent: true,
      };
    }
    if (!existingUser.isAccountSetupDone) {
      return { success: true, isAccountSetupDone: false };
    }

    return { success: true, isAccountSetupDone: true };
  } */

  const { email, password, code } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email) {
    return { error: ErrorMessages("invalidCredentials") };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return {
      success: SuccessMessages("activateLinkSent"),
      verificationEmailSent: true,
    };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: ErrorMessages("invalidCode") };
      }

      if (twoFactorToken.token !== code) {
        return { error: ErrorMessages("invalidCode") };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: ErrorMessages("codeHasExpired") };
      }

      await TwoFactorToken.findByIdAndDelete(twoFactorToken._id);

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser._id
      );

      if (existingConfirmation) {
        TwoFactorConfirmation.findByIdAndDelete(existingConfirmation._id);
      }

      await TwoFactorConfirmation.create({
        userId: existingUser._id,
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    console.log("before signin in login action");
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || `/${locale}/${DEFAULT_LOGIN_REDIRECT}`,
    });
    console.log("after signin in login action");
  } catch (error) {
    if (error instanceof AuthError) {
      // Hack to make broken CredentialsSignin work
      if (error.cause?.err instanceof Error) {
        return { error: error.cause.err.message };
      }
      return { error: ErrorMessages("somethingWentWrong") };
      /*  switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      } */
    }
    throw error;
  }
};
