"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import {
  addTagToMailchimpUser,
  addUserToSubscriberList,
  sendVerificationEmail,
  setCustomFieldsForMailchimpUser,
} from "@/lib/mail";
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

  const { email, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } =
    validatedFields.data;

  if (process.env.NODE_ENV === "development" && !email.endsWith("@daqil.com")) {
    return {
      error: ErrorMessages("onlyDaqilEmailsAllowed"),
    };
  }

  const existingUser = await getUserByEmail(email);

  if (existingUser && existingUser.isAccountSetupDone) {
    return {
      error: ErrorMessages("pleaseCheckInput"),
    };
  }

  const password = generatePassword();

  const hashedPassword = await bcrypt.hash(password, 10);

  const marketingData: Record<string, unknown> = {
    utmSource: utmSource || null,
    utmMedium: utmMedium || null,
    utmCampaign: utmCampaign || null,
    utmTerm: utmTerm || null,
    utmContent: utmContent || null,
  };

  // If any UTM parameter exists, add dateCaptured
  if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent) {
    marketingData.dateCaptured = new Date();
  }

  if (existingUser && !existingUser.isAccountSetupDone) {
    const updateData = { password: hashedPassword, ...marketingData };
    await User.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
      updateData,
    });
  } else {
    await User.create({
      password: hashedPassword,
      role: UserRole.CLIENT,
      email: email.toLowerCase(),
      clientBalance: { amount: 0, currency: "USD" },
      selectedTherapist: {
        therapist: null,
        clientIntroTherapistSelectionStatus: "PENDING",
        introCallDone: false,
      },
      appointments: [],
      selectedTherapistHistory: [],
      marketingData,
    });
  }

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  const customFields = {
    UTMSOURCE: utmSource || "",
    UTMMEDIUM: utmMedium || "",
    UTMCAMP: utmCampaign || "",
    UTMTERM: utmTerm || "",
    UTMCONTENT: utmContent || "",
    UTMDATE: marketingData.dateCaptured
      ? new Date(marketingData.dateCaptured as Date).toISOString()
      : "",
  };

  // Update Mailchimp custom fields
  await setCustomFieldsForMailchimpUser(email, customFields);

  const response = await addUserToSubscriberList(verificationToken.email);

  await addTagToMailchimpUser(
    email.toLowerCase(),
    process.env.MAILCHIMP_CLIENT_TAG as string
  );

  if (response?.error) {
    console.error(response.error);
  }

  return {
    success: SuccessMessages("linkToActivate"),
  };
};
