import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import JournalNote from "@/models/JournalNote";
import { fetchSentimentResults } from "@/lib/rev-ai";
import { addTranscriptionJobToQueue } from "@/lib/qstash";

export const POST = async (req: NextRequest) => {
  try {
    await connectToMongoDB();
    const body = await req.json();
    const { job } = body;
    const { id: sentimentJobId, status } = job;

    if (status !== "completed") {
      console.error(
        `Sentiment analysis job ${sentimentJobId} failed or is not completed. Current status: ${status}`
      );

      // Additional log to capture potential causes or reasons for failure
      console.error(
        `Possible reasons: job might still be processing, encountered an error during analysis, or the status is unexpected.`
      );

      // Log full job object for detailed debugging
      console.log("Full job object received:", job);

      await JournalNote.findOneAndUpdate(
        { sentimentJobId },
        { summaryStatus: "error" }
      );

      return NextResponse.json(
        {
          error: "Sentiment analysis job not successful",
          details: `Job ID: ${sentimentJobId}, Status: ${status}`,
        },
        { status: 400 }
      );
    }

    const journalNote = await JournalNote.findOne({ sentimentJobId });

    if (!journalNote) {
      await JournalNote.findOneAndUpdate(
        { sentimentJobId },
        { summaryStatus: "error" }
      );
      return NextResponse.json(
        { error: "Failed to retrieve journalNote result" },
        { status: 500 }
      );
    }

    await addTranscriptionJobToQueue(journalNote.revJobId, sentimentJobId);

    console.log("Sentiment analysis saved for job:", sentimentJobId);
    return NextResponse.json(
      { message: "Sentiment analysis successfully processed" },
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
