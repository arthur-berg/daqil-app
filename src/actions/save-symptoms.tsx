"use server";
import * as z from "zod";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import { LanguagesSchema, SymptomsSchema } from "@/schemas";

export async function saveSymptoms(values: z.infer<typeof SymptomsSchema>) {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  const validatedFields = SymptomsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { symptoms } = validatedFields.data;

  try {
    const therapist = await requireAuth([UserRole.THERAPIST]);

    await User.findByIdAndUpdate(therapist.id, {
      $set: {
        "settings.treatedSymptoms": symptoms,
      },
    });

    // Find the appointment

    return { success: SuccessMessages("symptomsSaved") };
  } catch (error) {
    return { error: ErrorMessages("somethingWentWrong") };
  }
}

export async function saveLanguages(values: z.infer<typeof LanguagesSchema>) {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  const validatedFields = LanguagesSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { languages } = validatedFields.data;

  try {
    const therapist = await requireAuth([UserRole.THERAPIST]);

    await User.findByIdAndUpdate(therapist.id, {
      $set: {
        "settings.languages": languages,
      },
    });

    // Find the appointment

    return { success: SuccessMessages("languagesSaved") };
  } catch (error) {
    return { error: ErrorMessages("somethingWentWrong") };
  }
}
