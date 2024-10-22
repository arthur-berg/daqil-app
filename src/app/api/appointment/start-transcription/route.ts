import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import jwt from "jsonwebtoken";
import { retrieveArchive } from "@/lib/vonage";
import { sendToRevAI } from "@/lib/rev-ai";
import JournalNote from "@/models/JournalNote";
const SIGNATURE_SECRET = process.env.VONAGE_SIGNATURE_SECRET as string;

export const POST = async (req: NextRequest) => {
  try {
    await connectToMongoDB();
    const requestHeaders = new Headers(req.headers);
    const authHeader = requestHeaders.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SIGNATURE_SECRET, {
      algorithms: ["HS256"],
    });

    const body = await req.json();
    const { id, status } = body;

    console.log(`Received archive event. Archive ID: ${id}, Status: ${status}`);

    if (status === "available") {
      const archive = await retrieveArchive(id);

      const audioUrl = archive.url;

      if (!audioUrl || archive.duration < 2) {
        await JournalNote.findOneAndUpdate(
          { archiveId: id },
          { summaryStatus: "error" }
        );
        console.log(
          "Archive duration too short or no audio URL available. Marked as error."
        );
        return;
      }

      const revJobId = await sendToRevAI(audioUrl, id);

      console.log(`Rev.ai Job created. Job ID: ${revJobId}`);
    }

    return NextResponse.json(
      { message: "Start transcription success" },
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
