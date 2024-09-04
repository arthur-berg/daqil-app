"use server";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { UserRole } from "@/generalTypes";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import { DiscountCodeSchema, InviteTherapistSchema } from "@/schemas";
import { getTranslations } from "next-intl/server";
import User from "@/models/User";
import { getUserByEmail } from "@/data/user";
import { generatePassword } from "@/utils";
import { addUserToSubscriberList, sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import DiscountCode from "@/models/DiscountCode";
import { revalidatePath } from "next/cache";

export const admin = async () => {
  const { role } = await getCurrentRole();

  if (role === UserRole.ADMIN) {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
};

export const deleteDiscountCode = async (discountCodeId: string) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    await requireAuth([UserRole.ADMIN]);

    await DiscountCode.findByIdAndDelete(discountCodeId);
    revalidatePath("/admin/discount-codes");
    return { success: SuccessMessages("discountCodeDeleted") };
  } catch (error) {
    console.error("Error deleting discount code", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};

export const createDiscountCode = async (
  values: z.infer<typeof DiscountCodeSchema>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    await requireAuth([UserRole.ADMIN]);

    const validatedFields = DiscountCodeSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    const {
      code,
      percentage,
      firstTimeUserOnly,
      limitPerUser,
      startDate,
      endDate,
    } = validatedFields.data;

    await DiscountCode.create({
      code,
      percentage,
      firstTimeUserOnly,
      limitPerUser,
      startDate,
      endDate,
    });

    return { success: SuccessMessages("discountCodeCreated") };
  } catch (error) {
    console.error("Error inviting therapist", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};

export const inviteTherapist = async (
  values: z.infer<typeof InviteTherapistSchema>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    await requireAuth([UserRole.ADMIN]);

    const validatedFields = InviteTherapistSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return {
        error: ErrorMessages("userWithEmailExists"),
      };
    }

    const password = generatePassword();

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      role: UserRole.THERAPIST,
    });

    const verificationToken = await generateVerificationToken(email, 168); // 7 days

    const isTherapist = true;

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
      password,
      isTherapist
    );

    const response = await addUserToSubscriberList(verificationToken.email);

    if (response?.error) {
      console.error(response.error);
    }

    return { success: SuccessMessages("therapistInvited") };
  } catch (error) {
    console.error("Error inviting therapist", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
