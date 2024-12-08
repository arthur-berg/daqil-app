"use server";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getUserById } from "@/data/user";
import { UserRole } from "@/generalTypes";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";

export const markBothUserAsShowedUp = async (appointmentId: string) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  try {
    await requireAuth([UserRole.THERAPIST, UserRole.CLIENT]);

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return { error: ErrorMessages("appointmentNotFound") };
    }

    const client = await getUserById(appointment.participants[0].userId);
    const isIntroCall =
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION;

    let updatePayload: Record<string, unknown> = {};
    const updateOptions: Record<string, unknown> = { new: true };

    if (!client.selectedTherapist?.introCallDone && isIntroCall) {
      await User.findByIdAndUpdate(client._id, {
        $set: { "selectedTherapist.introCallDone": true },
      });
    }

    updateOptions.arrayFilters = [{ "elem.userId": client._id }];

    if (!appointment.participants[0].showUp) {
      updatePayload["participants.$[elem].showUp"] = true;
      await Appointment.findByIdAndUpdate(
        appointmentId,
        { $set: updatePayload },
        updateOptions
      );
    }

    if (!appointment.hostShowUp) {
      updatePayload.hostShowUp = true;
      await Appointment.findByIdAndUpdate(appointmentId, {
        $set: updatePayload,
      });
    }
  } catch (error) {
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
