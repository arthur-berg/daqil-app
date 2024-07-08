import { generateToken, getCredentials } from "@/lib/opentok";
import { NextResponse } from "next/server";

const sessions = {};

export async function GET(req: Request) {
  try {
    console.log("here");
    const { room: roomName } = req.params;
    console.log(sessions);
    if (sessions[roomName]) {
      const data = generateToken(sessions[roomName]);
      NextResponse.json(
        {
          sessionId: sessions[roomName],
          token: data.token,
          apiKey: data.apiKey,
        },
        { status: 200 }
      );
    } else {
      const data = await getCredentials();
      sessions[roomName] = data.sessionId;
      NextResponse.json(
        {
          sessionId: data.sessionId,
          token: data.token,
          apiKey: data.apiKey,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error.message);
    NextResponse.json({ message: error.message }, { status: 500 });
  }
}
