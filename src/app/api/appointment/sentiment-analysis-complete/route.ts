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
        `Sentiment analysis job ${sentimentJobId} failed or is not completed.`
      );
      return NextResponse.json(
        { error: "Sentiment analysis job not successful" },
        { status: 400 }
      );
    }

    /*  const sentimentResult = await fetchSentimentResults(sentimentJobId);

    if (!sentimentResult) {
      return NextResponse.json(
        { error: "Failed to retrieve sentiment analysis result" },
        { status: 500 }
      );
    } */

    const journalNote = await JournalNote.findOne({ sentimentJobId });

    if (!journalNote) {
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
