"use server";

import { UserRole } from "@/generalTypes";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { createSessionAndToken, generateToken } from "@/lib/vonage";
import Appointment from "@/models/Appointment";
import VideoSession from "@/models/VideoSession";

if (!process.env.VONAGE_VIDEO_APP_ID) {
  throw new Error("Missing config values for env params VONAGE_VIDEO_APP_ID ");
}

/* export const getAllSessions = async () => {
  const user = await getCurrentUser();
  try {
    console.log("user", user);
    const sessions = await VideoSession.find({ hostId: user?.id });
    const participants = await User.find({});
    console.log("sessions", sessions);
    return sessions;
  } catch (error: any) {
    throw new Error("Error fetching all sessions: " + error.message);
  }
}; */

const getTokenExpiresAt = (user: any, session: any) => {
  const isTherapist = user?.role === "THERAPIST";

  if (isTherapist) {
    console.log("session.hostTokenExpiresAt", session.hostTokenExpiresAt);
    return session.hostTokenExpiresAt;
  }

  const patient = session.participants.find(
    (participant) => participant.id === user.id
  );

  return patient.tokenExpiresAt;
};

const isUserAuthorized = async (session: any, user: any) => {
  const role = user?.role;

  const isTherapist = role === "THERAPIST";
  const isPatient = role === "USER";

  if (isTherapist) {
    const isAuthorizedTherapist = isTherapist && session.hostId === user?.id;
    return isAuthorizedTherapist;
  }

  if (isPatient) {
    const isAuthorizedPatient = isPatient && getPatient(session, user);
    return isAuthorizedPatient;
  }

  return false;
};

const getPatient = (session: any, user: any) => {
  const patient = session.participants.find(
    (participant: any) => participant.id === user?.id
  );

  return patient;
};

export const getSessionData = async (appointmentId: string) => {
  const user = await requireAuth(["THERAPIST", "USER"]);

  const isTherapist = user?.role === "THERAPIST";
  const isPatient = user?.role === "USER";

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    let session = await VideoSession.findOne({ appointmentId });

    if (session) {
      const userAuthorized = await isUserAuthorized(session, user);

      if (!userAuthorized) {
        throw new Error("User is not authorized");
      }

      const now = new Date();

      const tokenExpiresAt = getTokenExpiresAt(user, session);

      if (tokenExpiresAt > now) {
        console.log("Valid token found...");
        console.log("session", session);
        let token;
        if (isTherapist) {
          token = session.hostToken;
        }
        if (isPatient) {
          const patient = getPatient(session, user);
          token = patient.token;
        }
        return {
          sessionId: session.sessionId,
          token: token,
          appId: process.env.VONAGE_VIDEO_APP_ID as any,
          roomName: session.roomName,
        };
      } else {
        console.log("Valid expires. Generating a new one...");

        const data = generateToken(session.sessionId);

        let videoSessionData: Record<string, unknown> = {};

        if (isTherapist) {
          videoSessionData = {
            token: data.token,
            hostTokenExpiresAt: data.expiresAt,
          };
        }

        if (isPatient) {
          videoSessionData = {
            participants: [
              {
                userId: user.id,
                token: data.token,
                tokenExpiresAt: data.expiresAt,
              },
            ],
          };
        }

        await VideoSession.updateOne(
          {
            appointmentId: appointment._id,
          },
          videoSessionData
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

      let videoSessionData: Record<string, unknown> = {};

      if (user?.role === UserRole.THERAPIST) {
        videoSessionData = {
          sessionId: data?.sessionId,
          roomName: appointment.title,
          appointmentId: appointment._id,
          hostId: appointment.therapistId,
          hostToken: data?.token,
          hostTokenExpiresAt: data?.expiresAt,
          participants: [
            {
              userId: appointment.patientId,
            },
          ],
        };
      }

      if (user?.role === UserRole.USER) {
        videoSessionData = {
          sessionId: data?.sessionId,
          roomName: appointment.title,
          appointmentId: appointment._id,
          participants: [
            {
              userId: appointment.patientId,
              token: data?.token,
              tokenExpiresAt: data?.expiresAt,
            },
          ],
        };
      }

      await VideoSession.create(videoSessionData);

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
