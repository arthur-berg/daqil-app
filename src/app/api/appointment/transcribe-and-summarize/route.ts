import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import jwt from "jsonwebtoken";
const SIGNATURE_SECRET = process.env.VONAGE_SIGNATURE_SECRET as string;

export const POST = async (req: NextRequest) => {
  try {
    await connectToMongoDB();
    console.log("ARCHIVE WAS MADE");
    console.log("INSIDE transcribe and summarize");
    const requestHeaders = new Headers(req.headers);
    const authHeader = requestHeaders.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SIGNATURE_SECRET, {
      algorithms: ["HS256"],
    });

    // Token is valid, handle the incoming webhook data
    const body = await req.json();
    console.log("Incoming data:", body);

    // Process the recording event (e.g., trigger transcription)
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
