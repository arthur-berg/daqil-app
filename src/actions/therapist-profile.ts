"use server";
import * as z from "zod";
import { TherapistMyProfileSchema } from "@/schemas";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import connectToMongoDB from "@/lib/mongoose";

export const updateTherapistProfile = async (
  values: z.infer<typeof TherapistMyProfileSchema>
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    const validatedFields = TherapistMyProfileSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    const data = validatedFields.data;

    await User.findByIdAndUpdate(user.id, {
      therapistWorkProfile: {
        en: {
          title: data.workTitleEn,
          description: data.workDescriptionEn,
        },
        ar: {
          title: data.workTitleAr,
          description: data.workDescriptionAr,
        },
      },
    });

    revalidatePath("/therapist/my-profile");

    return { success: SuccessMessages("therapistProfileUpdated") };
  } catch (error) {
    console.error("Error updating therapist profile", error);
    return { error: ErrorMessages("failedToUpdateTherapistProfile") };
  }
};

export const uploadTherapistProfileImage = async (uploadedFileKey: string) => {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    await User.findByIdAndUpdate(user.id, {
      image: uploadedFileKey,
    });

    return { success: SuccessMessages("profileImageUploaded") };
  } catch (error) {
    console.error("Error uploading therapist profile image", error);
    return { error: ErrorMessages("failedToUploadProfileImage") };
  }
};
