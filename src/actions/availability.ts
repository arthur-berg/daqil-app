"use server";

import * as z from "zod";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import {
  SaveDefaultAvailabilitySchema,
  DefaultAvailabilitySettingsSchemaBE,
} from "@/schemas";
import { getTranslations } from "next-intl/server";

export const updateDefaultAvailabilitySettings = async (
  values: z.infer<typeof DefaultAvailabilitySettingsSchemaBE>
) => {
  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    const [tSuccess, tError] = await Promise.all([
      getTranslations("SuccessMessages"),
      getTranslations("ErrorMessages"),
    ]);

    const validatedFields =
      DefaultAvailabilitySettingsSchemaBE.safeParse(values);

    if (!validatedFields.success) {
      return { error: tError("invalidFields") };
    }

    if (!user.availableTimes) {
      user.availableTimes = {
        blockedOutTimes: [],
        specificAvailableTimes: [],
        defaultAvailableTimes: [],
        settings: {
          interval: 15,
          fullDayRange: { from: "09:00", to: "17:00" },
        },
      };
    }

    await User.findByIdAndUpdate(user.id, {
      $set: {
        "availableTimes.settings.interval": values.interval,
        "availableTimes.settings.fullDayRange.from": values.fullDayRange.from,
        "availableTimes.settings.fullDayRange.to": values.fullDayRange.to,
      },
    });

    return { success: "Settings successfully updated" };
  } catch (error) {
    console.error("Error saving default available settings", error);
    return { error: "Failed to save available times." };
  }
};

export const saveDefaultAvailableTimes = async (
  values: z.infer<typeof SaveDefaultAvailabilitySchema>
) => {
  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    const [tSuccess, tError] = await Promise.all([
      getTranslations("SuccessMessages"),
      getTranslations("ErrorMessages"),
    ]);

    const validatedFields = SaveDefaultAvailabilitySchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: tError("invalidFields") };
    }

    const data = validatedFields.data;

    console.log("validatedFields", validatedFields);

    if (!user.availableTimes) {
      user.availableTimes = {
        settings: {
          interval: 15,
          fullDayRange: { from: "09:00", to: "17:00" },
        },
        blockedOutTimes: [],
        specificAvailableTimes: [],
        defaultAvailableTimes: [],
      };
    }

    const filteredAvailableTimes =
      user.availableTimes.defaultAvailableTimes?.filter(
        (availableTime: any) => availableTime.day !== data.day
      ) ?? {};

    const mergedDefaultTimes = [...filteredAvailableTimes, data];

    user.availableTimes.defaultAvailableTimes = mergedDefaultTimes;

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.defaultAvailableTimes": mergedDefaultTimes,
    });

    return { success: "Available times saved successfully." };
  } catch (error) {
    console.error("Error saving available times", error);
    return { error: "Failed to save available times." };
  }
};
