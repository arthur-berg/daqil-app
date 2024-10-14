import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import connectToMongoDB from "@/lib/mongoose";
import { stopArchive } from "@/lib/vonage"; // import the stopArchive function from your Vonage helper

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    await connectToMongoDB();

    const body = await req.json();
    const { archiveId } = body;

    if (!archiveId) {
      return NextResponse.json(
        { error: "Missing archive id" },
        { status: 404 }
      );
    }

    const archive = await stopArchive(archiveId);

    console.log("response from stop archive", archive);

    return NextResponse.json({
      message: `Success`,
      archive,
    });
  } catch (error) {
    console.error("Error stopping archive:", error);
    return NextResponse.json(
      { error: "Failed to stop archive" },
      { status: 500 }
    );
  }
});
