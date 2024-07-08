/* const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;
const appId = process.env.VONAGE_APP_ID;
const privateKeyPath = process.env.VONAGE_PRIVATE_KEY_PATH;

if (!apiKey || !apiSecret || !appId || !privateKeyPath) {
  throw new Error(
    "Missing config values for env params VONAGE_API_KEY and VONAGE_API_SECRET"
  );
}
let sessionId;

import { Auth } from "@vonage/auth";
import { Video } from "@vonage/video";

const credentials = new Auth({
  apiKey: apiKey,
  apiSecret: apiSecret,
  applicationId: appId,
  privateKey: privateKeyPath,
});

const options = {};

const videoClient = new Video(credentials, options);

const createSessionandToken = async () => {
  try {
    const session = await videoClient.createSession({
      mediaMode: "relayed" as any,
    });
    
    const token = videoClient.generateClientToken(session.sessionId);

    return {
      sessionId: session.sessionId,
      token: token,
    };
  } catch (error) {
    console.error("Error creating session: ", error);
  }
};

export const generateToken = (sessionId: string) => {
  const token = videoClient.generateClientToken(sessionId);
  return { token: token, appId: appId };
};

export const getCredentials = async () => {
  const data = await createSessionandToken();
  sessionId = data?.sessionId;
  const token = data?.token;
  return { sessionId: sessionId, token: token, appId: appId };
}; */

/* export const listArchives = async (sessionId) => {
  return new Promise((resolve, reject) => {
    const options = { sessionId };
    opentok.listArchives(options, (error, archives) => {
      if (error) {
        reject(error);
      } else {
        resolve(archives);
      }
    });
  });
}; */

/* export const initiateArchiving = async (sessionId) => {
  const archive = await createArchive(sessionId);
  return archive;
};

export const stopArchiving = async (archiveId) => {
  console.log(archiveId);
  const response = await stopArchive(archiveId);
  return response;
};
 */

/* export const createArchive = (session) => {
  return new Promise((resolve, reject) => {
    opentok.startArchive(
      session,
      { layout: { screenshareType: "horizontalPresentation" } },
      function (error, archive) {
        if (error) {
          reject(error);
        } else {
          resolve(archive);
        }
      }
    );
  });
};

export const stopArchive = (archive) => {
  return new Promise((resolve, reject) => {
    opentok.stopArchive(archive, function (error, session) {
      if (error) {
        reject(error);
      } else {
        resolve(archive);
      }
    });
  });
}; */
