"use server";

import { isUserAuthorized } from "@/actions/videoSessions/utils";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { createSessionAndToken, generateToken } from "@/lib/vonage";
import Appointment from "@/models/Appointment";
import VideoSession from "@/models/VideoSession";

if (!process.env.VONAGE_APP_ID) {
  throw new Error("Missing config values for env params VONAGE_APP_ID ");
}

export const getSessionData = async (appointmentId: string) => {
  const user = await requireAuth(["THERAPIST", "CLIENT"]);
  const { isTherapist, isClient } = await getCurrentRole();

  try {
    let updatePayload: Record<string, unknown> = {};
    const updateOptions: Record<string, unknown> = { new: true };

    if (isTherapist) {
      updatePayload.hostShowUp = true;
    }

    /*  const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    } */

    if (isClient) {
      updateOptions.arrayFilters = [{ "elem.userId": user.id }];
      updatePayload["participants.$[elem].showUp"] = true;
      /* const participant = appointment.participants.find(
        (participant: any) =>
          participant.userId.toString() === user.id.toString()
      );

      updateOptions.arrayFilters = [{ "elem.userId": user.id }];

      if (participant && participant.showUp) {
        console.log("Participant already marked as showed up");
      } else {
        updatePayload["participants.$[elem].showUp"] = true;
      } */
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updatePayload },
      updateOptions
    );

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    /*  if (Object.keys(updatePayload).length > 0) {
      await Appointment.findByIdAndUpdate(
        appointmentId,
        { $set: updatePayload },
        updateOptions
      );
    } */

    let session = await VideoSession.findOne({ appointmentId });

    if (session) {
      console.log("Session found. Generating new token...");
      console.log("HERE");
      const userAuthorized = await isUserAuthorized(
        session,
        isTherapist,
        isClient,
        user?.id
      );

      if (!userAuthorized) {
        throw new Error("User is not authorized");
      }

      const data = generateToken(session.sessionId);

      return {
        sessionId: session.sessionId,
        token: data.token,
        appId: data.appId,
        roomName: session.roomName,
      };
    } else {
      console.log("Session not found. Creating a new one...");
      const data = await createSessionAndToken();

      await VideoSession.create({
        sessionId: data?.sessionId,
        roomName: appointment.title,
        hostUserId: appointment.hostUserId,
        appointmentId: appointment._id,
        participants: appointment.participants,
      });

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
