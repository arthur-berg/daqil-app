"use server";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";

export const updateUserCampaignId = async (
  userId: string,
  campaignId: string
) => {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    await requireAuth([UserRole.CLIENT, UserRole.THERAPIST]);
    /* await User.findByIdAndUpdate(userId, {
      $set: { marketingCampaignId: campaignId },
    }); */
    return { success: SuccessMessages("campaignIdUpdated") };
  } catch (error: any) {
    console.error("Internal Error: ", error);
    return {
      error: ErrorMessages("somethingWentWrong"),
    };
  }
};
