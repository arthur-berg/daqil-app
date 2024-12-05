"use server";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";

export const markProfessionalAgreementAsDone = async () => {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  try {
    const user = await requireAuth([UserRole.THERAPIST]);

    await User.findByIdAndUpdate(user.id, {
      professionalAgreementAccepted: true,
    });
    return { success: SuccessMessages("professionalAgreementAccepted") };
  } catch (error) {
    console.error("error in mark professional agreement as done", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
