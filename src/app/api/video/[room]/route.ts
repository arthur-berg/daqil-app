import { generateToken, getCredentials } from "@/lib/opentok";
import { NextRequest, NextResponse } from "next/server";

const sessions: Record<string, unknown> = {};

export async function GET(req: NextRequest, context: any) {
  try {
    const { params } = context;
    const { room: roomName } = params;

    if (sessions[roomName]) {
      console.log("Session found, generating token...");
      const data = generateToken(sessions[roomName] as string);
      return NextResponse.json(
        {
          sessionId: sessions[roomName],
          token: data.token,
          appId: data.appId,
        },
        { status: 200 }
      );
    } else {
      console.log("No session found. Creating new session...");
      const data = await getCredentials();
      sessions[roomName] = data.sessionId;

      return NextResponse.json(
        {
          sessionId: data.sessionId,
          token: data.token,
          appId: data.appId,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
