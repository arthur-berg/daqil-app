"use server";

import { requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import { retrieveArchive, stopArchive } from "@/lib/vonage";
import { sendToRevAI } from "@/lib/rev-ai";
import { UserRole } from "@/generalTypes";
import { getTranslations } from "next-intl/server";
import { cancelPaymentRelatedJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";
import { revalidatePath } from "next/cache";
import JournalNote from "@/models/JournalNote";

export const generateJournalNote = async (
  journalNoteId: string,
  archiveId: string,
  appointmentId: string
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth([UserRole.THERAPIST]);

    await cancelPaymentRelatedJobsForAppointment(appointmentId);

    await stopArchive(archiveId);

    await JournalNote.findByIdAndUpdate(journalNoteId, {
      summaryStatus: "pending",
    });

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "completed",
    });

    revalidatePath("/[locale]/therapist/clients/[clientId]", "page");

    return {
      success: SuccessMessages("journalNoteGenerationInProgress"),
    };
  } catch (error) {
    console.error("Internal Error: ", error);
    return {
      error: ErrorMessages("somethingWentWrong"),
    };
  }
};
