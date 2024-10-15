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

    /*  await cancelPaymentRelatedJobsForAppointment(appointmentId);
   

     await stopArchive(archiveId);

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "completed",
    }); */

    // Step 1: Retrieve archive details from Vonage
    const archive = await retrieveArchive(archiveId);
    console.log("finished retrieving archive");

    console.log("archive", archive);

    // Step 2: Ensure the archive status is "available" before proceeding
    if (archive.status !== "available") {
      console.error(
        `Archive is not available. Current status: ${archive.status}`
      );
      throw new Error("Archive is not available yet");
    }

    const audioUrl = archive.url;

    if (!audioUrl) {
      throw new Error(
        "No archive URL available. Unable to proceed with transcription."
      );
    }

    console.log("Retrieved archive audio URL:", audioUrl);

    // Step 3: Send audio URL to Rev.ai for transcription
    const revJobId = await sendToRevAI(audioUrl);

    console.log(`Rev.ai Job created. Job ID: ${revJobId}`);

    return {
      success: SuccessMessages("journalNoteGenerated"),
    };
  } catch (error) {
    console.error("Internal Error: ", error);
    return {
      error: ErrorMessages("somethingWentWrong"),
    };
  }
};
