"use server";

import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import CodeRedemption from "@/models/CodeRedemption";
import DiscountCode from "@/models/DiscountCode";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import User from "@/models/User";

export const checkDiscountCodeValidity = async (discountCode: string) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = await requireAuth([UserRole.CLIENT]);

    const client = await User.findById(user.id);

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
      const hasPreviousBookings = client.appointments.some((appointment: any) =>
        appointment.bookedAppointments.some(
          (bookedAppointment: any) =>
            bookedAppointment.status === "completed" &&
            bookedAppointment.appointmentTypeId.toString() !==
              APPOINTMENT_TYPE_ID_INTRO_SESSION
        )
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
