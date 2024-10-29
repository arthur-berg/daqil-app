import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import JournalNote from "@/models/JournalNote";
import { revalidatePath } from "next/cache";
import { summarizeTranscribedText } from "@/lib/openai";
import { getTranscriptionDetails } from "@/lib/rev-ai";
import Appointment from "@/models/Appointment";
import { upsertJournalNoteToPinecone } from "@/lib/pincecone";

export const POST = async (req: NextRequest) => {
  try {
    await connectToMongoDB();

    const body = await req.json();
    const { jobId, sentimentJobId } = body;

    if (!jobId) {
      console.error("Missing archiveId or transcript in the request.");
      await JournalNote.findOneAndUpdate(
        { revJobId: jobId },
        { summaryStatus: "error" }
      );
      return NextResponse.json(
        { error: "Missing archiveId or transcript" },
        { status: 400 }
      );
    }

    const transcriptionResult = await getTranscriptionDetails(
      jobId,
      sentimentJobId
    );

    if (!transcriptionResult) {
      console.error(
        `Failed to retrieve transcription result for job ID: ${jobId}`
      );
      await JournalNote.findOneAndUpdate(
        { revJobId: jobId },
        { summaryStatus: "error" }
      );
      return NextResponse.json(
        { error: "Failed to retrieve transcription result" },
        { status: 500 }
      );
    }

    const { transcript, sentimentAnalysis } = transcriptionResult;

    const summary = await summarizeTranscribedText(
      transcript,
      sentimentAnalysis
    );

    if (!summary) {
      await JournalNote.findOneAndUpdate(
        { revJobId: jobId },
        { summaryStatus: "error" }
      );
      return NextResponse.json(
        { error: "Failed to retrieve summary from chatgpt" },
        { status: 500 }
      );
    }

    const updatedJournalNote = await JournalNote.findOneAndUpdate(
      { revJobId: jobId },
      { summary, summaryStatus: "review" },
      { new: true }
    );

    if (!updatedJournalNote) {
      throw new Error(`No JournalNote found with jobId: ${jobId}`);
    }

    const appointmentId = updatedJournalNote.appointmentId;

    const appointment = (await Appointment.findById(appointmentId)) as any;
    const clientId = appointment.participants[0].userId.toString();
    const therapistId = appointment.hostUserId.toString();

    await upsertJournalNoteToPinecone(
      clientId,
      summary,
      appointmentId,
      therapistId
    );

    console.log(`Updated JournalNote for revJobId: ${jobId}`);

    revalidatePath("/therapist/clients/[clientId]", "page");

    return NextResponse.json(
      { message: "Job processed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Something went wrong:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
