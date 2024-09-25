"use server";

import * as z from "zod";
import { PaymentSettingsSchema } from "@/schemas";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import connectToMongoDB from "@/lib/mongoose";
import { UserRole } from "@/generalTypes";
import { getTranslations } from "next-intl/server";

export const saveTherapistPaymentSettings = async (
  data: z.infer<typeof PaymentSettingsSchema>
) => {
  // Step 1: Connect to the database
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  // Step 2: Fetch authenticated therapist
  const therapist = await requireAuth([UserRole.ADMIN, UserRole.THERAPIST]);

  if (!therapist) {
    return { error: ErrorMessages("therapistNotExist") };
  }

  // Step 3: Validate the data with the schema
  const validatedData = PaymentSettingsSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { accountType, country, paymentMethod } = validatedData.data;

  // Step 4: Prepare the updated payment settings based on account type
  const updateData: any = {
    "paymentSettings.country": country,
    "paymentSettings.paymentMethod": paymentMethod,
  };

  if (accountType === "personal") {
    updateData["paymentSettings.personal"] = {
      kyc: {
        firstName: validatedData.data.firstName,
        lastName: validatedData.data.lastName,
        dateOfBirth: validatedData.data.dob,
        placeOfBirth: validatedData.data.placeOfBirth,
        citizenship: validatedData.data.citizenship,
      },
      bankDetails: {
        bankName: validatedData.data.bankName,
        accountNumber: validatedData.data.accountNumber,
        clearingNumber: validatedData.data.clearingNumber,
        accountType: validatedData.data.accountSubtype,
      },
    };
    updateData["paymentSettings.type"] = "personal";
  } else if (accountType === "company") {
    updateData["paymentSettings.company"] = {
      kyc: {
        ownerName: validatedData.data.ownerName,
        ownerRole: validatedData.data.ownerRole,
        dateOfBirth: validatedData.data.dob,
        placeOfBirth: validatedData.data.placeOfBirth,
        citizenship: validatedData.data.citizenship,
        companyRegistration: validatedData.data.companyRegistration,
      },
      bankDetails: {
        bankName: validatedData.data.bankName,
        iban: validatedData.data.iban,
        swift: validatedData.data.swift,
      },
    };
    updateData["paymentSettings.type"] = "company";
  }

  // Step 5: Save the payment settings to the therapist's account
  try {
    await User.findByIdAndUpdate(therapist.id, {
      $set: updateData,
    });
    return { success: SuccessMessages("paymentSettingsSaved") };
  } catch (error) {
    console.error("Error saving payment settings:", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
