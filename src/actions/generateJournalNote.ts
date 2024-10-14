"use server";

import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";

export const generateJournalNote = async (journalNoteId: string) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  try {
    const user = await requireAuth([UserRole.CLIENT]);
  } catch (error) {
    console.error("Internal Error: ", error);
    return {
      error: ErrorMessages("somethingWentWrong"),
    };
  }
};
