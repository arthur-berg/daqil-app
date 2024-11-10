"use server";
import * as z from "zod";
import { OAuthAccountSetupSchema } from "@/schemas";
import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import { capitalizeFirstLetter } from "@/utils";
import { getUserById } from "@/data/user";
import { revalidatePath } from "next/cache";
import {
  addTagToMailchimpUser,
  setCustomFieldsForMailchimpUser,
} from "@/lib/mail";

export const setupOAuthAccount = async (
  values: z.infer<typeof OAuthAccountSetupSchema>,
  userId: string
) => {
  await connectToMongoDB();

  const validatedFields = OAuthAccountSetupSchema.safeParse(values);
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { firstName, lastName, personalInfo, settings, termsAccepted } =
    validatedFields.data;

  const capitalizedFirstName = {
    en: capitalizeFirstLetter(firstName.en),
    ar: firstName.ar,
  };

  const capitalizedLastName = {
    en: capitalizeFirstLetter(lastName.en),
    ar: lastName.ar,
  };

  const updatedPersonalInfo = {
    ...personalInfo,
    phoneNumber: personalInfo.phoneNumber.replace(/\s+/g, ""),
  };

  const existingUser = await getUserById(userId);

  const updatedSettings = {
    ...existingUser.settings,
    timeZone: settings.timeZone,
  };

  const updateFields: any = {
    isAccountSetupDone: true,
    firstName: capitalizedFirstName,
    lastName: capitalizedLastName,
    personalInfo: updatedPersonalInfo,
    settings: updatedSettings,
  };

  if (termsAccepted) {
    updateFields.termsAccepted = true;
    updateFields.termsAcceptedAt = new Date();
  }

  try {
    await User.findByIdAndUpdate(userId, updateFields);

    const customFields = {
      FNAME_EN: capitalizedFirstName.en,
      LNAME_EN: capitalizedLastName.en,
      FNAME_AR: capitalizedFirstName.ar || "",
      LNAME_AR: capitalizedLastName.ar || "",
      PHONE: updatedPersonalInfo.phoneNumber || "",
      SEX: personalInfo.sex,
      BIRTHDAY: personalInfo.dateOfBirth,
      COUNTRY: personalInfo.country,
    };

    await setCustomFieldsForMailchimpUser(existingUser.email, customFields);

    await addTagToMailchimpUser(existingUser.email, "account-setup-finished");

    revalidatePath("/settings");

    return { success: SuccessMessages("accountSetupComplete") };
  } catch (error) {
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
