/* "use server";

import OpenTok from "opentok";

const apiKey = process.env.VONAGE_API_KEY as string;
const apiSecret = process.env.VONAGE_API_SECRET as string;

let sessionId;

const opentok = new OpenTok(apiKey, apiSecret);

const sessionCallback = (error: any, session: any) => {
  if (error) {
    console.error(error);
    return error;
  } else {
    sessionId = session.sessionId;
    const token = opentok.generateToken(sessionId);
    return { sessionId: sessionId, token: token };
    //console.log("Session ID: " + sessionId);
  }
};

export const createSessionandToken = () => {
  const session = opentok.createSession(
    { mediaMode: "relayed" },
    sessionCallback
  );
  console.log("session", session);

 
};
 */
