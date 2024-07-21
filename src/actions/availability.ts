"use server";

import * as z from "zod";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import {
  DefaultAvailabilitySchema,
  DefaultAvailabilitySettingsSchemaBE,
  SpecificAvailabilitySchemaBE,
} from "@/schemas";
import { getTranslations } from "next-intl/server";
import { isSameDay } from "date-fns";
import { revalidatePath } from "next/cache";

export const saveSpecificAvailableTimes = async (
  values: z.infer<typeof SpecificAvailabilitySchemaBE>
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

    const validatedFields = SpecificAvailabilitySchemaBE.safeParse(values);

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
    const data = validatedFields.data;

    const filteredAvailableTimes =
      user.availableTimes.specificAvailableTimes?.filter(
        (availableTime: any) =>
          !isSameDay(new Date(availableTime.date), new Date(data.date))
      ) ?? [];

    const mergedDefaultTimes = [...filteredAvailableTimes, data];

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.specificAvailableTimes": mergedDefaultTimes,
    });

    revalidatePath("/therapist/availability");

    return { success: "Specific availalbe times saved" };
  } catch (error) {
    console.error("Error saving specific available times", error);
    return { error: "Failed to save specific available times." };
  }
};

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
  values: z.infer<typeof DefaultAvailabilitySchema>
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

    const validatedFields = DefaultAvailabilitySchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: tError("invalidFields") };
    }

    const data = validatedFields.data;

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
