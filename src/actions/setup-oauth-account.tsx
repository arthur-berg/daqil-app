"use server";
import * as z from "zod";
import { OAuthAccountSetupSchema } from "@/schemas";
import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import { capitalizeFirstLetter } from "@/utils";

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

  const { firstName, lastName, personalInfo, settings } = validatedFields.data;

  const capitalizedFirstName = {
    en: capitalizeFirstLetter(firstName.en),
    ar: firstName.ar,
  };

  const capitalizedLastName = {
    en: capitalizeFirstLetter(lastName.en),
    ar: lastName.ar,
  };

  try {
    // Update the user information with the submitted values
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: capitalizedFirstName,
        lastName: capitalizedLastName,
        personalInfo,
        settings,
        isAccountSetupDone: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return { error: ErrorMessages("userNotFound") };
    }

    return { success: SuccessMessages("accountSetupComplete") };
  } catch (error) {
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
