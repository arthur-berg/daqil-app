import { Types } from "mongoose";
import TwoFactorConfirmation from "@/models/TwoFactorConfirmation";

export const getTwoFactorConfirmationByUserId = async (
  userId: Types.ObjectId
) => {
  try {
    const twoFactorConfirmation = await TwoFactorConfirmation.findOne({
      userId,
    });

    return twoFactorConfirmation;
  } catch {
    return null;
  }
};
