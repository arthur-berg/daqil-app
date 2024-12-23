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
import { getTherapistById, getUserById } from "@/data/user";
import { log } from "next-axiom";

if (!process.env.VONAGE_APP_ID) {
  throw new Error("Missing config values for env params VONAGE_APP_ID ");
}

let sessionCreationInProgress = false;

export const getSessionData = async (appointmentId: string) => {
  if (sessionCreationInProgress) {
    console.log("Session creation already in progress. Skipping request.");
    log.warn("Session creation already in progress. Skipping request.", {
      appointmentId,
    });

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
      log.warn("Appointment not found", { appointmentId });

      return { error: ErrorMessages("appointmentNotFound") };
    }

    const client = await getUserById(appointment.participants[0].userId);
    const therapist = await getTherapistById(appointment.hostUserId);

    if (!client) {
      log.warn("Participant not found in appointment", { appointmentId });
      sessionCreationInProgress = false;
      return { error: ErrorMessages("userNotFound") };
    }

    if (appointment.status !== "confirmed") {
      sessionCreationInProgress = false;
      log.warn("Appointment is not confirmed", { appointmentId });

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

    const isIntroCall =
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION;

    let session = await VideoSession.findOne({ appointmentId });
    const videoRecordingStarted = !!appointment.journalNoteId;

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
        log.error("User is not authorized", { userId: user?.id });

        throw new Error("User is not authorized");
      }

      const data = generateToken(session.sessionId);

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
          clientId: client._id.toString(),
          therapistsAvailableTimes: JSON.stringify(therapist.availableTimes),
          therapistsAppointments: JSON.stringify(therapist.appointments),
          therapistId: therapist._id.toString(),
        },
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
          clientId: client._id.toString(),
          therapistsAvailableTimes: JSON.stringify(therapist.availableTimes),
          therapistsAppointments: JSON.stringify(therapist.appointments),
          therapistId: therapist._id.toString(),
        },
      };
    }
  } catch (error: any) {
    sessionCreationInProgress = false;
    log.error("Error getting session data", {
      error: error.message,
      stack: error.stack,
    });

    throw new Error("Error getting credentials: " + error.message);
  }
};
