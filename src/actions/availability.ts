"use server";

import * as z from "zod";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import {
  RecurringAvailabilitySchema,
  RecurringAvailabilitySettingsSchemaBE,
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

    const data = validatedFields.data;

    const filteredAvailableTimes =
      user.availableTimes.specificAvailableTimes?.filter(
        (availableTime: any) =>
          !isSameDay(new Date(availableTime.date), new Date(data.date))
      ) ?? [];

    const mergedSpecificTimes = [...filteredAvailableTimes, data];

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.specificAvailableTimes": mergedSpecificTimes,
    });

    revalidatePath("/therapist/availability");

    return { success: "Specific availalbe times saved" };
  } catch (error) {
    console.error("Error saving specific available times", error);
    return { error: "Failed to save specific available times." };
  }
};

export const updateRecurringAvailabilitySettings = async (
  values: z.infer<typeof RecurringAvailabilitySettingsSchemaBE>
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
      RecurringAvailabilitySettingsSchemaBE.safeParse(values);

    if (!validatedFields.success) {
      return { error: tError("invalidFields") };
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
    console.error("Error saving availability settings", error);
    return { error: "Failed to save available times." };
  }
};

export const saveRecurringAvailableTimes = async (
  values: z.infer<typeof RecurringAvailabilitySchema>
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

    const validatedFields = RecurringAvailabilitySchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: tError("invalidFields") };
    }

    const data = validatedFields.data;

    const filteredAvailableTimes =
      user.availableTimes.recurringAvailableTimes?.filter(
        (availableTime: any) => availableTime.day !== data.day
      ) ?? {};

    const mergedRecurringTimes = [...filteredAvailableTimes, data];

    user.availableTimes.recurringAvailableTimes = mergedRecurringTimes;

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.recurringAvailableTimes": mergedRecurringTimes,
    });

    return { success: "Available times saved successfully." };
  } catch (error) {
    console.error("Error saving available times", error);
    return { error: "Failed to save available times." };
  }
};
