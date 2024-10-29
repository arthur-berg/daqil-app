import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import { addTranscriptionJobToQueue } from "@/lib/qstash";
import JournalNote from "@/models/JournalNote";
import { submitSentimentAnalysisJob } from "@/lib/rev-ai";

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

      await JournalNote.findOneAndUpdate(
        { revJobId: jobId },
        { summaryStatus: "error" }
      );
      return NextResponse.json(
        { error: "Transcription job was not successful" },
        { status: 400 }
      );
    }

    const sentimentJobId = await submitSentimentAnalysisJob(jobId);

    if (!sentimentJobId) {
      console.error("Failed to submit sentiment analysis job.");
      await JournalNote.findOneAndUpdate(
        { revJobId: jobId },
        { summaryStatus: "error" }
      );
      return NextResponse.json(
        { error: "Failed to submit sentiment analysis job" },
        { status: 500 }
      );
    }

    await JournalNote.findOneAndUpdate(
      { revJobId: jobId },
      { sentimentJobId: sentimentJobId }
    );

    console.log(`Successfully updated JournalNote for revJobId: ${jobId}`);

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
