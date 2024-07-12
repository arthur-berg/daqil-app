"use server";

import {
  getCreatePayload,
  getSavedToken,
  getTokenExpiresAt,
  getUpdatePayload,
  isUserAuthorized,
} from "@/actions/videoSessions/utils";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { createSessionAndToken, generateToken } from "@/lib/vonage";
import Appointment from "@/models/Appointment";
import VideoSession from "@/models/VideoSession";

if (!process.env.VONAGE_VIDEO_APP_ID) {
  throw new Error("Missing config values for env params VONAGE_VIDEO_APP_ID ");
}

export const getSessionData = async (appointmentId: string) => {
  const user = await requireAuth(["THERAPIST", "USER"]);
  const { isTherapist, isPatient } = await getCurrentRole();

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    let session = await VideoSession.findOne({ appointmentId });

    if (session) {
      const userAuthorized = await isUserAuthorized(
        session,
        isTherapist,
        isPatient,
        user?.id
      );

      if (!userAuthorized) {
        throw new Error("User is not authorized");
      }

      const now = new Date();

      const tokenExpiresAt = await getTokenExpiresAt(
        session,
        isTherapist,
        user?.id
      );

      if (tokenExpiresAt > now) {
        console.log("Valid token found...");
        console.log("session", session);

        return {
          sessionId: session.sessionId,
          token: await getSavedToken(session, isTherapist, user?.id),
          appId: process.env.VONAGE_VIDEO_APP_ID as any,
          roomName: session.roomName,
        };
      } else {
        console.log("Valid expires. Generating a new one...");

        const data = generateToken(session.sessionId);

        const videoSessionPayload = getUpdatePayload(
          data,
          isTherapist,
          user?.id
        );

        await VideoSession.updateOne(
          {
            appointmentId: appointment._id,
          },
          videoSessionPayload
        );

        return {
          sessionId: session.sessionId,
          token: data.token,
          appId: data.appId,
          roomName: session.roomName,
        };
      }
    } else {
      console.log("Session not found. Creating a new one...");
      const data = await createSessionAndToken();

      const videoSessionPayload = getCreatePayload(
        data,
        isTherapist,
        appointment
      );

      await VideoSession.create(videoSessionPayload);

      return {
        roomName: appointment.title,
        sessionId: data?.sessionId,
        token: data?.token,
        appId: data?.appId,
      };
    }
  } catch (error: any) {
    throw new Error("Error getting credentials: " + error.message);
  }
};
