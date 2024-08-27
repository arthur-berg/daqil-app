"use server";

import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export const rejectTherapist = async (therapistId: string) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth([UserRole.CLIENT]);

    const therapist = await User.findById(therapistId);

    if (!therapist) {
      return { error: ErrorMessages("therapistNotExist") };
    }

    await User.findByIdAndUpdate(user.id, {
      $set: {
        "selectedTherapist.therapist": null,
        "selectedTherapist.clientAcceptedTherapist": false,
      },
    });

    revalidatePath("/book-appointment");

    return { success: SuccessMessages("therapistRejected") };
  } catch (error) {
    console.error("Error deleting discount code", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};

export const acceptTherapist = async (therapistId: string) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth([UserRole.CLIENT]);

    const therapist = await User.findById(therapistId);

    if (!therapist) {
      return { error: ErrorMessages("therapistNotExist") };
    }

    const update = await User.findByIdAndUpdate(user.id, {
      $set: {
        "selectedTherapist.clientAcceptedTherapist": true,
      },
    });
    console.log("update", update);

    revalidatePath("/book-appointment");

    return { success: SuccessMessages("therapistAccepted") };
  } catch (error) {
    console.error("Error deleting discount code", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
