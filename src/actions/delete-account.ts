"use server";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { UserRole } from "@/generalTypes";

export const deleteAccount = async () => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth([UserRole.THERAPIST, UserRole.CLIENT]);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        "firstName.en": "Deleted",
        "lastName.en": "",
        "firstName.ar": "Deleted",
        "lastName.ar": "",
        emailVerified: false,
        email: `deleted_${user.id}@example.com`,
        "personalInfo.phoneNumber": null,
        "personalInfo.dateOfBirth": null,
        "personalInfo.country": null,
        isAccountSetupDone: false,
        accountStatus: "DELETED",
        $unset: {
          paymentSettings: "",
        },
      },
    });

    return { success: SuccessMessages("accountDeleted") };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { error: ErrorMessages("accountDeletionFailed") };
  }
};
