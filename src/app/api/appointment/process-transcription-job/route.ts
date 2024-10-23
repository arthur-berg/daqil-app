import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import JournalNote from "@/models/JournalNote";
import { revalidatePath } from "next/cache";
import { summarizeTranscribedText } from "@/lib/openai";
import { getTranscriptionDetails } from "@/lib/rev-ai";

export const POST = async (req: NextRequest) => {
  try {
    await connectToMongoDB();

    console.log("inside process-transcription-job");

    const body = await req.json();
    const { jobId } = body;

    console.log("body", JSON.stringify(body));

    console.log("jobId", jobId);

    if (!jobId) {
      console.error("Missing archiveId or transcript in the request.");
      return NextResponse.json(
        { error: "Missing archiveId or transcript" },
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

    console.log("Processing job for archiveId:", archiveId);

    const summary = await summarizeTranscribedText(transcript);

    console.log("Generated summary for archiveId:", archiveId);

    const updatedJournalNote = await JournalNote.findOneAndUpdate(
      { archiveId },
      { summary, summaryStatus: "review" },
      { new: true }
    );

    if (!updatedJournalNote) {
      throw new Error(`No JournalNote found with archiveId: ${archiveId}`);
    }

    console.log(`Updated JournalNote for archiveId: ${archiveId}`);

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
