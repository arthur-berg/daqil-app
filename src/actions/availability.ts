"use server";

import * as z from "zod";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import {
  SaveDefaultAvailabilitySchema,
  DefaultAvailabilitySettingsSchema,
} from "@/schemas";
import { getTranslations } from "next-intl/server";

export const updateDefaultAvailabilitySettings = async (
  values: z.infer<typeof DefaultAvailabilitySettingsSchema>
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

    const validatedFields = DefaultAvailabilitySettingsSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: tError("invalidFields") };
    }

    if (!user.availableTimes) {
      user.availableTimes = {
        blockedOutTimes: [],
        specificAvailableTimes: [],
        defaultAvailable: { settings: {} },
      };
    }

    if (!user.availableTimes.defaultAvailable) {
      user.availableTimes.defaultAvailable = { settings: {} };
    }

    await User.findByIdAndUpdate(user.id, {
      $set: {
        "availableTimes.defaultAvailable.settings.interval": values.interval,
        "availableTimes.defaultAvailable.settings.fullDayRange.from":
          values.fullDayRange.from,
        "availableTimes.defaultAvailable.settings.fullDayRange.to":
          values.fullDayRange.to,
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

    if (!user.availableTimes) {
      user.availableTimes = {
        blockedOutTimes: [],
        specificAvailableTimes: [],
        defaultAvailable: {},
      };
    }

    const filteredAvailableTimes =
      user.availableTimes.defaultAvailable?.availableTimes.filter(
        (availableTime: any) => availableTime.day !== data.day
      ) ?? {};

    const mergedDefaultTimes = [...filteredAvailableTimes, data];

    user.availableTimes.defaultAvailable.availableTimes = mergedDefaultTimes;

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.defaultAvailable.availableTimes": mergedDefaultTimes,
    });

    return { success: "Available times saved successfully." };
  } catch (error) {
    console.error("Error saving available times", error);
    return { error: "Failed to save available times." };
  }
};
