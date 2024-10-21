import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import JournalNote from "@/models/JournalNote";
import { getTranscriptionDetails } from "@/lib/rev-ai";
import { revalidatePath } from "next/cache";
import { summarizeTranscribedText } from "@/lib/openai";

export const POST = async (req: NextRequest) => {
  try {
    await connectToMongoDB();
    const body = await req.json();

    const { id: jobId, status } = body.job;

    if (!jobId || !status) {
      console.error("Missing job ID or status in the webhook payload.");
      return NextResponse.json(
        { error: "Missing job ID or status in the webhook payload" },
        { status: 400 }
      );
    }

    if (status !== "transcribed") {
      console.error(
        `Transcription job ${jobId} did not complete successfully. Status: ${status}`
      );
      return NextResponse.json(
        { error: "Transcription job was not successful" },
        { status: 400 }
      );
    }

    const transcriptionResult = await getTranscriptionDetails(jobId);

    if (!transcriptionResult) {
      console.error(
        `Failed to retrieve transcription result for job ID: ${jobId}`
      );
      return NextResponse.json(
        { error: "Failed to retrieve transcription result" },
        { status: 500 }
      );
    }

    const { transcript, archiveId } = transcriptionResult;

    const summary = await summarizeTranscribedText(transcript);

    const updatedJournalNote = await JournalNote.findOneAndUpdate(
      { archiveId },
      { summary: summary, summaryStatus: "review" },
      { new: true }
    );

    if (!updatedJournalNote) {
      console.error(`No JournalNote found with archiveId: ${archiveId}`);
      return NextResponse.json(
        { error: "No matching JournalNote found" },
        { status: 404 }
      );
    }

    console.log(
      `Successfully updated JournalNote for archive ID: ${archiveId}`
    );

    revalidatePath("/therapist/clients/[clientId]", "page");

    return NextResponse.json(
      { message: "Transcription successfully processed and saved" },
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
