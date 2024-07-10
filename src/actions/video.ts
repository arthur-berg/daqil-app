"use server";

import { createSessionAndToken, generateToken } from "@/lib/vonage";

const sessions = {};

export const getCredentials = async (roomName: string) => {
  try {
    console.log(sessions);
    if (sessions[roomName]) {
      console.log("Session found. Generating token...");
      const data = generateToken(sessions[roomName]);
      return {
        sessionId: sessions[roomName],
        token: data.token,
        apiKey: data.apiKey,
      };
    } else {
      console.log("Session not found. Creating new session...");
      const data = await createSessionAndToken();
      sessions[roomName] = data.sessionId;
      return {
        sessionId: data.sessionId,
        token: data.token,
        apiKey: data.apiKey,
      };
    }
  } catch (error) {
    throw new Error("Error getting credentials", error);
  }
};
