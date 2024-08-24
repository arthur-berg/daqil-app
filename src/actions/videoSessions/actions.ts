"use server";

import { isUserAuthorized } from "@/actions/videoSessions/utils";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { createSessionAndToken, generateToken } from "@/lib/vonage";
import Appointment from "@/models/Appointment";
import VideoSession from "@/models/VideoSession";
import { getTranslations } from "next-intl/server";

if (!process.env.VONAGE_APP_ID) {
  throw new Error("Missing config values for env params VONAGE_APP_ID ");
}

export const getSessionData = async (appointmentId: string) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth(["THERAPIST", "CLIENT"]);
    const { isTherapist, isClient } = await getCurrentRole();

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return { error: ErrorMessages("appointmentNotFound") };
    }

    if (appointment.status !== "confirmed") {
      // Return error if the appointment is not confirmed
      return { error: ErrorMessages("appointmentNotConfirmed") };
    }

    const currentTime = new Date();
    const startDate = new Date(appointment.startDate);
    const endDate = new Date(appointment.endDate);

    // Calculate the time windows
    const timeBeforeStart = new Date(startDate.getTime() - 20 * 60 * 1000); // 20 minutes before startDate
    const timeAfterEnd = new Date(endDate.getTime() + 15 * 60 * 1000); // 15 minutes after endDate

    // Check if the current time is within the allowed window
    if (currentTime < timeBeforeStart || currentTime > timeAfterEnd) {
      // Return error if the appointment is outside the allowed time window
      return {
        error: ErrorMessages("videoMeetingOnlyAvailable"),
      };
    }

    let updatePayload: Record<string, unknown> = {};
    const updateOptions: Record<string, unknown> = { new: true };

    if (isTherapist) {
      if (!appointment.hostShowUp) {
        updatePayload.hostShowUp = true;
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { $set: updatePayload },
          updateOptions
        );
      }
    }

    if (isClient) {
      const participant = appointment.participants.find(
        (participant: any) =>
          participant.userId.toString() === user.id.toString()
      );

      if (!participant) {
        return { error: ErrorMessages("userNotFound") };
      }

      updateOptions.arrayFilters = [{ "elem.userId": user.id }];

      if (!participant.showUp) {
        updatePayload["participants.$[elem].showUp"] = true;
        await Appointment.findByIdAndUpdate(
          appointmentId,
          { $set: updatePayload },
          updateOptions
        );
      }
    }

    let session = await VideoSession.findOne({ appointmentId });

    if (session) {
      console.log("Session found. Generating new token...");
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
