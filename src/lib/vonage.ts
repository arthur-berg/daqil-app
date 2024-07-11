const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;
const appId = process.env.VONAGE_VIDEO_APP_ID;
const privateKey = process.env.VONAGE_VIDEO_PRIVATE_KEY_PATH;

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
  privateKey: privateKey,
});

const options = {};

const videoClient = new Video(credentials, options);

const TOKEN_EXPIRATION_TIME = 60 * 60 * 24; // 24 hours in seconds

const getExpireTime = () =>
  Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_TIME;

const getExpirationDate = () =>
  new Date(Date.now() + TOKEN_EXPIRATION_TIME * 1000);

// TODO
// Experiment with expiresAt time for tokens, set to 1 minute and see that they expires
// Ask Vonage what they recommend as roles for the token for therapist and patient

export const createSessionAndToken = async () => {
  try {
    const session = await videoClient.createSession({
      mediaMode: MediaMode.RELAYED,
    });

    const token = videoClient.generateClientToken(session.sessionId);

    console.log("token", token);

    return {
      sessionId: session.sessionId,
      token: token,
      expiresAt: getExpirationDate(),
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
    expiresAt: getExpirationDate(),
    appId: appId,
  };
};
