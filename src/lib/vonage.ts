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
import { ArchiveOutputMode, MediaMode, Video } from "@vonage/video";

const credentials = new Auth({
  apiKey: apiKey,
  apiSecret: apiSecret,
  applicationId: appId,
  privateKey: Buffer.from(privateKey, "base64"),
});

const options = {};

const videoClient = new Video(credentials, options);

export const createSessionAndToken = async () => {
  try {
    const session = await videoClient.createSession({
      mediaMode: MediaMode.ROUTED,
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

export const startArchive = async (
  sessionId: string,
  options: {
    hasAudio: boolean;
    hasVideo: boolean;
    outputMode?: ArchiveOutputMode;
  }
) => {
  try {
    const archiveOptions = {
      name: `Archive for session ${sessionId}`,
      hasAudio: options.hasAudio,
      hasVideo: options.hasVideo,
      outputMode: options.outputMode || ArchiveOutputMode.COMPOSED,
    };

    const archive = await videoClient.startArchive(sessionId, archiveOptions);

    console.log("Archive started successfully:", archive.id);

    return archive;
  } catch (error) {
    console.error("Error starting archive:", error);
    throw new Error("Failed to start archive");
  }
};

export const stopArchive = async (archiveId: string) => {
  try {
    const archive = await videoClient.stopArchive(archiveId);
    console.log("Archive stopped successfully:", archive);
    return archive;
  } catch (error) {
    console.error("Error stopping archive:", error);
    throw new Error("Failed to stop archive");
  }
};
