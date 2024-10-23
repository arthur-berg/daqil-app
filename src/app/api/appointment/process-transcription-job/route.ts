import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import JournalNote from "@/models/JournalNote";
import { revalidatePath } from "next/cache";
import { summarizeTranscribedText } from "@/lib/openai";
import { getTranscriptionDetails } from "@/lib/rev-ai";

export const POST = async (req: NextRequest) => {
  try {
    await connectToMongoDB();

    const body = await req.json();
    const { jobId } = body;
    console.log("jobId", jobId);

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

    const transcriptionResult = await getTranscriptionDetails(jobId);

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

    const { transcript } = transcriptionResult;

    const summary = await summarizeTranscribedText(transcript);

    const updatedJournalNote = await JournalNote.findOneAndUpdate(
      { revJobId: jobId },
      { summary, summaryStatus: "review" },
      { new: true }
    );

    if (!updatedJournalNote) {
      throw new Error(`No JournalNote found with jobId: ${jobId}`);
    }

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
