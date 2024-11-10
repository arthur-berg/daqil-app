"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { SetupAccountSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { login } from "@/actions/login";
import { getVerificationTokenByToken } from "@/data/verification-token";
import VerificationToken from "@/models/VerificationToken";
import {
  addUserNameToSubscriberProfile,
  setCustomFieldsForMailchimpUser,
} from "@/lib/mail";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { capitalizeFirstLetter } from "@/utils";
import { UserRole } from "@/generalTypes";

const verifyPasswordAndLogin = async ({
  existingUser,
  currentPassword,
  hashedPassword,
  firstName,
  lastName,
  email,
  password,
  locale,
  SuccessMessages,
  ErrorMessages,
}: {
  existingUser: any;
  currentPassword?: string;
  hashedPassword: string;
  firstName: { en: string; ar?: string };
  lastName: { en: string; ar?: string };
  email: string;
  password: string;
  locale: string;
  SuccessMessages: any;
  ErrorMessages: any;
}) => {
  await connectToMongoDB();
  if (!currentPassword) {
    return {
      error: ErrorMessages("currentPasswordIsRequired"),
      currentPasswordRequired: true,
    };
  }

  const passwordsMatch = await bcrypt.compare(
    currentPassword,
    existingUser.password
  );

  if (!passwordsMatch) {
    return { error: ErrorMessages("incorrectPassword") };
  }

  await User.findByIdAndUpdate(existingUser._id, {
    password: hashedPassword,
    isAccountSetupDone: true,
    firstName,
    lastName,
  });

  await login({ email, password }, locale);

  return { success: SuccessMessages("accountSuccessfullySetup") };
};

export const setupAccount = async (
  values: z.infer<typeof SetupAccountSchema>,
  locale: string,
  token?: string | null
) => {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const validatedFields = SetupAccountSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const {
    email,
    password,
    firstName,
    lastName,
    currentPassword,
    personalInfo,
    settings,
    termsAccepted,
  } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: ErrorMessages("emailNotExist") };
  }

  const capitalizedFirstName = {
    en: capitalizeFirstLetter(firstName.en),
    ar: firstName.ar,
  };

  const capitalizedLastName = {
    en: capitalizeFirstLetter(lastName.en),
    ar: lastName.ar,
  };

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!token) {
    return await verifyPasswordAndLogin({
      existingUser,
      currentPassword,
      hashedPassword,
      firstName: capitalizedFirstName,
      lastName: capitalizedLastName,
      email,
      password,
      locale,
      SuccessMessages,
      ErrorMessages,
    });
  }

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return await verifyPasswordAndLogin({
      existingUser,
      currentPassword,
      hashedPassword,
      firstName: capitalizedFirstName,
      lastName: capitalizedLastName,
      email,
      password,
      locale,
      SuccessMessages,
      ErrorMessages,
    });
  }

  const updatedPersonalInfo = {
    ...personalInfo,
    phoneNumber: personalInfo.phoneNumber.replace(/\s+/g, ""),
  };

  const updatedSettings = {
    ...existingUser.settings,
    timeZone: settings.timeZone,
  };

  const updateFields: any = {
    password: hashedPassword,
    isAccountSetupDone: true,
    firstName: capitalizedFirstName,
    lastName: capitalizedLastName,
    personalInfo: updatedPersonalInfo,
    settings: updatedSettings,
  };

  if (existingUser.role === UserRole.THERAPIST) {
    updateFields.therapistWorkProfile = {
      en: { title: "Psychologist", description: "" },
      ar: {
        title: updatedPersonalInfo.sex === "MALE" ? "طبيب نفسي" : "طبيبة نفسية",
        description: "",
      },
    };
  }

  if (termsAccepted) {
    updateFields.termsAccepted = true;
    updateFields.termsAcceptedAt = new Date();
  }

  await User.findByIdAndUpdate(existingUser._id, updateFields);

  await VerificationToken.findByIdAndDelete(existingToken._id);

  const customFields = {
    FNAME_EN: capitalizedFirstName.en,
    LNAME_EN: capitalizedLastName.en,
    FNAME_AR: capitalizedFirstName.ar || "",
    LNAME_AR: capitalizedLastName.ar || "",
    PHONE: personalInfo.phoneNumber || "",
    SEX: personalInfo.sex,
    BIRTHDAY: personalInfo.dateOfBirth,
    COUNTRY: personalInfo.country,
    ACC_SETUP: "YES",
  };

  await setCustomFieldsForMailchimpUser(email, customFields);

  await login({ email, password }, locale);

  return { success: SuccessMessages("accountSuccessfullySetup") };
};
