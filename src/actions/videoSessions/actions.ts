"use server";

import { getFullName } from "@/utils/formatName";
import { isUserAuthorized } from "@/actions/videoSessions/utils";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { createSessionAndToken, generateToken } from "@/lib/vonage";
import { addMinutes, subMinutes, isBefore, isAfter, isPast } from "date-fns";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import VideoSession from "@/models/VideoSession";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { getUserById } from "@/data/user";

if (!process.env.VONAGE_APP_ID) {
  throw new Error("Missing config values for env params VONAGE_APP_ID ");
}

let sessionCreationInProgress = false;

export const getSessionData = async (appointmentId: string) => {
  if (sessionCreationInProgress) {
    console.log("Session creation already in progress. Skipping request.");
    return;
  }

  sessionCreationInProgress = true;
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
      sessionCreationInProgress = false;
      return { error: ErrorMessages("appointmentNotFound") };
    }

    const client = await getUserById(appointment.participants[0].userId);

    if (appointment.status !== "confirmed") {
      sessionCreationInProgress = false;
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

    const isIntroCall =
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION;

    if (isPast(startDate) || startDate.getTime() === new Date().getTime()) {
      if (isTherapist) {
        if (!appointment.hostShowUp) {
          updatePayload.hostShowUp = true;
          await Appointment.findByIdAndUpdate(
            appointmentId,
            { $set: updatePayload },
            updateOptions
          );
        }

        if (
          !client.selectedTherapist?.introCallDone &&
          isIntroCall &&
          appointment.participants[0].showUp
        ) {
          await User.findByIdAndUpdate(client._id, {
            $set: { "selectedTherapist.introCallDone": true },
          });
        }
      }

      if (isClient) {
        const participant = appointment.participants.find(
          (participant: any) =>
            participant.userId.toString() === client._id.toString()
        );

        if (!participant) {
          sessionCreationInProgress = false;
          return { error: ErrorMessages("userNotFound") };
        }

        if (
          !client.selectedTherapist?.introCallDone &&
          isIntroCall &&
          appointment.hostShowUp
        ) {
          await User.findByIdAndUpdate(client._id, {
            $set: { "selectedTherapist.introCallDone": true },
          });
        }

        updateOptions.arrayFilters = [{ "elem.userId": client._id }];

        if (!participant.showUp) {
          updatePayload["participants.$[elem].showUp"] = true;
          await Appointment.findByIdAndUpdate(
            appointmentId,
            { $set: updatePayload },
            updateOptions
          );
        }
      }
    }

    let session = await VideoSession.findOne({ appointmentId });
    const videoRecordingStarted = !!appointment.journalNoteId;

    console.log("session", session);

    if (session) {
      console.log("Session found. Generating new token...");
      const userAuthorized = await isUserAuthorized(
        session,
        isTherapist,
        isClient,
        user?.id
      );

      if (!userAuthorized) {
        sessionCreationInProgress = false;
        throw new Error("User is not authorized");
      }

      const data = generateToken(session.sessionId);
      console.log("data in 1", data);

      sessionCreationInProgress = false;
      return {
        sessionId: session.sessionId,
        token: data.token,
        appId: data.appId,
        roomName: session.roomName,
        isIntroCall,
        appointmentData: {
          id: appointment._id.toString(),
          endDate: appointment.endDate,
          videoRecordingStarted,
          startDate: appointment.startDate,
          clientName: await getFullName(client.firstName, client.lastName),
          clientPhoneNumber: client.personalInfo.phoneNumber,
        },
      };
    } else {
      const data = await createSessionAndToken();
      console.log("data in 2", data);

      await VideoSession.create({
        sessionId: data?.sessionId,
        roomName: appointment.title,
        hostUserId: appointment.hostUserId,
        appointmentId: appointment._id,
        participants: appointment.participants,
      });

      sessionCreationInProgress = false;
      return {
        roomName: appointment.title,
        sessionId: data?.sessionId,
        token: data?.token,
        appId: data?.appId,
        isIntroCall,
        appointmentData: {
          id: appointment._id.toString(),
          endDate: appointment.endDate,
          videoRecordingStarted,
          startDate: appointment.startDate,
          clientName: await getFullName(client.firstName, client.lastName),
          clientPhoneNumber: client.personalInfo.phoneNumber,
        },
      };
    }
  } catch (error: any) {
    sessionCreationInProgress = false;
    throw new Error("Error getting credentials: " + error.message);
  }
};
