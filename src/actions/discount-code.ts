"use server";

import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import CodeRedemption from "@/models/CodeRedemption";
import DiscountCode from "@/models/DiscountCode";
import { getTranslations } from "next-intl/server";

export const checkDiscountCodeValidity = async (discountCode: string) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth([UserRole.CLIENT]);

    if (!discountCode) {
      return {
        error: ErrorMessages("missingDiscountCode"),
      };
    }

    const code = await DiscountCode.findOne({ code: discountCode });

    if (!code) {
      return {
        error: ErrorMessages("invalidDiscountCode"),
      };
    }

    const now = new Date();
    if (code.startDate && now < code.startDate) {
      return {
        error: ErrorMessages("discountCodeNotStarted"),
      };
    }
    if (code.endDate && now > code.endDate) {
      return {
        error: ErrorMessages("discountCodeExpired"),
      };
    }

    if (code.firstTimeUserOnly) {
      const hasPreviousBookings = user.appointments.some(
        (appointment: any) => appointment.bookedAppointments.length > 0
      );

      if (hasPreviousBookings) {
        return {
          error: ErrorMessages("firstTimeUserOnly"),
        };
      }
    }

    const redemptionCount = await CodeRedemption.countDocuments({
      userId: user.id,
      discountCodeId: code._id,
    });

    if (code.limitPerUser && redemptionCount >= code.limitPerUser) {
      return {
        error: ErrorMessages("redeemedCodeLimitReached"),
      };
    }

    console.log("code", code);

    return {
      success: SuccessMessages("discountCodeValid"),
      discount: code.percentage,
      requiresTracking: !!code.limitPerUser || !!code.firstTimeUserOnly,
      discountCodeId: code._id,
    };
  } catch (error) {
    console.error("Internal Error: ", error);
    return {
      error: ErrorMessages("somethingWentWrong"),
    };
  }
};
