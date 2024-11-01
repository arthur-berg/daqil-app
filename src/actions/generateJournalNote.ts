"use server";

import { requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import { retrieveArchive, stopArchive } from "@/lib/vonage";
import { getRevJobStatus, sendToRevAI } from "@/lib/rev-ai";
import { UserRole } from "@/generalTypes";
import { getTranslations } from "next-intl/server";
import { cancelAllScheduledJobsForAppointment } from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";
import { revalidatePath } from "next/cache";
import JournalNote from "@/models/JournalNote";

async function handleArchiveStatus(
  archiveId: string,
  journalNoteId: string,
  appointmentId: string,
  ErrorMessages: any
) {
  const archive = await retrieveArchive(archiveId);

  if (!archive) {
    console.error("Archive not found");
    return { error: ErrorMessages("archiveNotFound") };
  }

  if (archive.status === "stopped" || archive.status === "available") {
    console.log(`Archive is already in a final state: ${archive.status}`);

    const journalNote = await JournalNote.findOne({ archiveId });
    if (
      journalNote.summaryStatus === "notStarted" &&
      archive.status === "available"
    ) {
      startRevJob(archiveId, ErrorMessages);
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: "completed",
      });
      return null;
    }

    if (
      archive.status === "stopped" &&
      journalNote.summaryStatus === "notStarted"
    ) {
      await JournalNote.findOneAndUpdate(
        { archiveId },
        { summaryStatus: "pending" }
      );
      return null;
    }
    return {
      error:
        archive.status === "stopped"
          ? ErrorMessages("archiveAlreadyStopped")
          : ErrorMessages("archiveAlreadyAvailable"),
    };
  }

  try {
    await stopArchive(archiveId);
    console.log("Archive stopped successfully");
    await updateAppointmentAndJournalStatus(journalNoteId, appointmentId);
  } catch (stopError: any) {
    if (stopError.response?.status === 409) {
      console.log("Archive already stopped or in a final state.");
      return handleRevJobStatus(archiveId, journalNoteId, ErrorMessages);
    } else {
      throw stopError;
    }
  }

  return null;
}

async function updateAppointmentAndJournalStatus(
  journalNoteId: string,
  appointmentId: string
) {
  await JournalNote.findByIdAndUpdate(journalNoteId, {
    summaryStatus: "pending",
  });
  await Appointment.findByIdAndUpdate(appointmentId, {
    status: "completed",
  });
}

async function handleRevJobStatus(
  archiveId: string,
  journalNoteId: string,
  ErrorMessages: any
) {
  const journalNote = await JournalNote.findOne({ archiveId });
  if (!journalNote) {
    console.error("No journal note found for the given archiveId.");
    return { error: ErrorMessages("journalNoteNotFound") };
  }

  const { status } = await getRevJobStatus(journalNote.revJobId);

  if (status === "in_progress" || status === "transcribed") {
    console.log(
      "Rev.ai job already in progress or completed. No action required."
    );
  } else if (status === "failed") {
    console.log("Rev.ai job was started but then FAILED.");
    await JournalNote.findOneAndUpdate(
      { archiveId },
      { summaryStatus: "error" }
    );
  } else {
    return startRevJob(archiveId, ErrorMessages);
  }

  return null;
}

async function startRevJob(archiveId: string, ErrorMessages: any) {
  const archive = await retrieveArchive(archiveId);
  const audioUrl = archive.url;

  if (!audioUrl || archive.duration < 2) {
    await JournalNote.findOneAndUpdate(
      { archiveId },
      { summaryStatus: "error" }
    );
    console.log(
      "Archive duration too short or no audio URL available. Marked as error."
    );
    return { error: ErrorMessages("appointmentTooShortForJournalNote") };
  }

  const newRevJobId = await sendToRevAI(audioUrl);
  console.log("Started new Rev.ai job with ID:", newRevJobId);

  await JournalNote.findOneAndUpdate(
    { archiveId },
    { revJobId: newRevJobId, summaryStatus: "pending" }
  );

  return null;
}

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
    await requireAuth([UserRole.THERAPIST]);
    await cancelAllScheduledJobsForAppointment(appointmentId);

    const response = await handleArchiveStatus(
      archiveId,
      journalNoteId,
      appointmentId,
      ErrorMessages
    );

    if (response?.error) {
      return { error: response.error };
    }

    revalidatePath(
      "/[locale]/(protected)/therapist/clients/[clientId]",
      "page"
    );

    return { success: SuccessMessages("journalNoteGenerationInProgress") };
  } catch (error) {
    console.error("Internal Error: ", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
