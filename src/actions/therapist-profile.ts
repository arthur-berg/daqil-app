"use server";
import * as z from "zod";
import { TherapistMyProfileSchema } from "@/schemas";
import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import connectToMongoDB from "@/lib/mongoose";

export const updateTherapistProfile = async (
  values: z.infer<typeof TherapistMyProfileSchema>,
  adminPageProps?: { therapistId: string }
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

    // Sanitize the HTML input to prevent XSS attacks
    const sanitizedWorkDescriptionEn = sanitizeHtml(data.workDescriptionEn, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe"]),
      allowedAttributes: false,
    });

    const sanitizedWorkDescriptionAr = sanitizeHtml(data.workDescriptionAr, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe"]),
      allowedAttributes: false,
    });

    let userToUpdate;

    if (!!adminPageProps) {
      const therapist = await User.findById(adminPageProps.therapistId);
      userToUpdate = therapist._id;
    } else {
      userToUpdate = user.id;
    }

    await User.findByIdAndUpdate(userToUpdate, {
      $set: {
        "therapistWorkProfile.en.description": sanitizedWorkDescriptionEn,
        "therapistWorkProfile.ar.description": sanitizedWorkDescriptionAr,
      },
    });

    revalidatePath("/therapist/my-profile");

    return { success: SuccessMessages("therapistProfileUpdated") };
  } catch (error) {
    console.error("Error updating therapist profile", error);
    return { error: ErrorMessages("failedToUpdateTherapistProfile") };
  }
};

export const uploadTherapistProfileImage = async (
  uploadedFileKey: string,
  adminPageProps?: { therapistId: string }
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

    let userToUpdate;

    if (!!adminPageProps) {
      const therapist = await User.findById(adminPageProps.therapistId);
      userToUpdate = therapist._id;
    } else {
      userToUpdate = user.id;
    }

    await User.findByIdAndUpdate(userToUpdate, {
      image: uploadedFileKey,
    });

    return { success: SuccessMessages("profileImageUploaded") };
  } catch (error) {
    console.error("Error uploading therapist profile image", error);
    return { error: ErrorMessages("failedToUploadProfileImage") };
  }
};
