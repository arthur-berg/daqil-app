"use server";

import { isUserAuthorized } from "@/actions/videoSessions/utils";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { createSessionAndToken, generateToken } from "@/lib/vonage";
import { addMinutes, subMinutes, isBefore, isAfter } from "date-fns";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import VideoSession from "@/models/VideoSession";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

if (!process.env.VONAGE_APP_ID) {
  throw new Error("Missing config values for env params VONAGE_APP_ID ");
}

export const getSessionData = async (appointmentId: string) => {
  await connectToMongoDB();
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
      return { error: ErrorMessages("appointmentNotConfirmed") };
    }

    const currentTime = new Date();
    const startDate = new Date(appointment.startDate);
    const endDate = new Date(appointment.endDate);

    const timeBeforeStart = subMinutes(startDate, 20);
    const timeAfterEnd = addMinutes(endDate, 15);

    /*    if (
      isBefore(currentTime, timeBeforeStart) ||
      isAfter(currentTime, timeAfterEnd)
    ) {
      return {
        error: ErrorMessages("videoMeetingOnlyAvailable"),
      };
    } */

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

      if (
        !user.selectedTherapist?.introCallDone &&
        appointment.appointmentTypeId.toString() ===
          APPOINTMENT_TYPE_ID_INTRO_SESSION
      ) {
        await User.findByIdAndUpdate(user.id, {
          $set: { "selectedTherapist.introCallDone": true },
        });
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
