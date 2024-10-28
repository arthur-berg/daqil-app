import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import connectToMongoDB from "@/lib/mongoose";
import { stopArchive, retrieveArchive } from "@/lib/vonage";

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

    // Retrieve the current status of the archive
    const archive = await retrieveArchive(archiveId);

    if (!archive) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    // Check if the archive is already stopped or completed
    if (["stopped", "available"].includes(archive.status)) {
      return NextResponse.json({
        message: `Archive is already in a final state: ${archive.status}`,
      });
    }

    // If the archive is in a stoppable state, proceed to stop it
    const stopResponse = await stopArchive(archiveId);

    console.log("Response from stop archive:", stopResponse);

    return NextResponse.json({
      message: `Success`,
      stopResponse,
    });
  } catch (error) {
    console.error("Error stopping archive:", error);
    return NextResponse.json(
      { error: "Failed to stop archive" },
      { status: 500 }
    );
  }
});
