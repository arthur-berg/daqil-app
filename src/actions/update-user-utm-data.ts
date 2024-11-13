"use server";

import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";

export const updateUserUTMData = async (userId: string, utmData: any) => {
  await connectToMongoDB();

  try {
    await User.findByIdAndUpdate(userId, {
      $set: {
        "marketingData.utmSource": utmData.utmSource,
        "marketingData.utmMedium": utmData.utmMedium,
        "marketingData.utmCampaign": utmData.utmCampaign,
        "marketingData.utmTerm": utmData.utmTerm,
        "marketingData.utmContent": utmData.utmContent,
        "marketingData.dateCaptured": new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating UTM data:", error);
    return { error: "Failed to update UTM data" };
  }
};
