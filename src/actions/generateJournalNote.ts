"use server";

import { requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import { retrieveArchive, stopArchive } from "@/lib/vonage";
import { sendToRevAI } from "@/lib/rev-ai";
import { UserRole } from "@/generalTypes";
import { getTranslations } from "next-intl/server";
import { cancelPaymentRelatedJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";

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
    console.log("archiveId", archiveId);

    await stopArchive(archiveId);

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "completed",
    });

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
