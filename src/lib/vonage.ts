const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;
const appId = process.env.VONAGE_APP_ID;
const privateKey = process.env.VONAGE_PRIVATE_KEY;

if (!apiKey || !apiSecret || !appId || !privateKey) {
  throw new Error(
    "Missing config values for env params VONAGE_API_KEY and VONAGE_API_SECRET"
  );
}

import { Auth } from "@vonage/auth";
import { MediaMode, Video } from "@vonage/video";

const credentials = new Auth({
  apiKey: apiKey,
  apiSecret: apiSecret,
  applicationId: appId,
  privateKey:
    process.env.NODE_ENV === "development"
      ? privateKey
      : Buffer.from(privateKey, "base64"),
});

const options = {};

const videoClient = new Video(credentials, options);

export const createSessionAndToken = async () => {
  try {
    const session = await videoClient.createSession({
      mediaMode: MediaMode.RELAYED,
    });

    const token = videoClient.generateClientToken(session.sessionId);

    return {
      sessionId: session.sessionId,
      token: token,
      appId: appId,
    };
  } catch (error) {
    console.error("Error creating session: ", error);
  }
};

export const generateToken = (sessionId: string) => {
  const token = videoClient.generateClientToken(sessionId);

  return {
    token: token,
    appId: appId,
  };
};
