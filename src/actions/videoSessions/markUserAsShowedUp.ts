"use server";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getUserById } from "@/data/user";
import { UserRole } from "@/generalTypes";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";

export const markUserAsShowedUp = async (appointmentId: string) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  try {
    await requireAuth([UserRole.THERAPIST, UserRole.CLIENT]);
    const { isTherapist, isClient } = await getCurrentRole();
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return { error: ErrorMessages("appointmentNotFound") };
    }

    const client = await getUserById(appointment.participants[0].userId);
    const isIntroCall =
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION;

    if (isClient) {
      if (
        !client.selectedTherapist?.introCallDone &&
        isIntroCall &&
        appointment.hostShowUp
      ) {
        await User.findByIdAndUpdate(client._id, {
          $set: { "selectedTherapist.introCallDone": true },
        });
      }

      if (!appointment.participants[0].showUp) {
        await Appointment.findOneAndUpdate(
          { _id: appointmentId, "participants.userId": client._id },
          { $set: { "participants.$.showUp": true } }
        );
      }
    }

    if (isTherapist) {
      if (!appointment.hostShowUp) {
        await Appointment.findByIdAndUpdate(appointmentId, {
          $set: { hostShowUp: true },
        });
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
  } catch (error) {
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
