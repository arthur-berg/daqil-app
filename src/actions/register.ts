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
import { UserRole } from "@/generalTypes";
import connectToMongoDB from "@/lib/mongoose";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  await connectToMongoDB();
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

  if (existingUser && existingUser.isAccountSetupDone) {
    return {
      error: ErrorMessages("pleaseCheckInput"),
    };
  }

  const password = generatePassword();

  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser && !existingUser.isAccountSetupDone) {
    await User.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
    });
  } else {
    await User.create({
      password: hashedPassword,
      role: UserRole.CLIENT,
      email,
      clientBalance: { amount: 0, currency: "USD" },
      selectedTherapist: {
        therapist: null,
        clientIntroTherapistSelectionStatus: "PENDING",
        introCallDone: false,
      },
      appointments: [],
      selectedTherapistHistory: [],
    });
  }

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  const response = await addUserToSubscriberList(verificationToken.email);

  if (response?.error) {
    console.error(response.error);
  }

  return {
    success: SuccessMessages("linkToActivate"),
  };
};
