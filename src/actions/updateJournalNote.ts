"use server";
import * as z from "zod";
import sanitizeHtml from "sanitize-html";
import { requireAuth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import JournalNote from "@/models/JournalNote";
import { UserRole } from "@/generalTypes";
import { revalidatePath } from "next/cache";
import { JournalNoteSchema } from "@/schemas";

export const updateJournalNote = async (
  journalNoteId: string,
  values: z.infer<typeof JournalNoteSchema>,
  summaryStatus: string
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    await requireAuth([UserRole.THERAPIST]);

    const validatedFields = JournalNoteSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    const data = validatedFields.data;

    const summary = sanitizeHtml(data.summary, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe"]),
      allowedAttributes: false,
    });

    const updatePayload: Record<string, unknown> = {
      summary: summary,
      note: values.note,
    };

    if (summaryStatus !== "completed") {
      updatePayload.summaryStatus = "completed";
    }

    const updatedJournalNote = await JournalNote.findByIdAndUpdate(
      journalNoteId,
      updatePayload,
      { new: true }
    );

    if (!updatedJournalNote) {
      return { error: ErrorMessages("journalNoteNotFound") };
    }

    revalidatePath(
      "/[locale]/(protected)/therapist/clients/[clientId]",
      "page"
    );

    return { success: SuccessMessages("journalNoteUpdated") };
  } catch (error) {
    console.error("Error updating journal note", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
