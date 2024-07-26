"use server";

import * as z from "zod";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import {
  RecurringAvailabilitySchema,
  RecurringAvailabilitySettingsSchemaBE,
  SpecificAvailabilitySchemaBE,
  BlockAvailabilitySchemaBE,
} from "@/schemas";
import { getTranslations } from "next-intl/server";
import { isSameDay } from "date-fns";
import { revalidatePath } from "next/cache";

export const saveBlockedOutTimes = async (
  values: z.infer<typeof BlockAvailabilitySchemaBE>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    const validatedFields = BlockAvailabilitySchemaBE.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    const data = validatedFields.data;

    const filteredBlockedOutTimes =
      user.availableTimes.blockedOutTimes?.filter(
        (blockedOutTime: any) =>
          !isSameDay(new Date(blockedOutTime.date), new Date(data.date))
      ) ?? [];

    const mergedBlockedTimes = [...filteredBlockedOutTimes, data];

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.blockedOutTimes": mergedBlockedTimes,
    });

    revalidatePath("/therapist/availability");

    return { success: SuccessMessages("blockedTimesSaved") };
  } catch (error) {
    console.error("Error saving specific available times", error);
    return { error: ErrorMessages("failedToSaveSpecificTimes") };
  }
};

export const saveSpecificAvailableTimes = async (
  values: z.infer<typeof SpecificAvailabilitySchemaBE>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    const validatedFields = SpecificAvailabilitySchemaBE.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
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

    return { success: SuccessMessages("specifcTimesSaves") };
  } catch (error) {
    console.error("Error saving specific available times", error);
    return { error: ErrorMessages("failedToSaveSpecificTimes") };
  }
};

export const updateRecurringAvailabilitySettings = async (
  values: z.infer<typeof RecurringAvailabilitySettingsSchemaBE>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    const validatedFields =
      RecurringAvailabilitySettingsSchemaBE.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    await User.findByIdAndUpdate(user.id, {
      $set: {
        "availableTimes.settings.interval": values.interval,
        "availableTimes.settings.fullDayRange.from": values.fullDayRange.from,
        "availableTimes.settings.fullDayRange.to": values.fullDayRange.to,
      },
    });

    return { success: SuccessMessages("settingsUpdated") };
  } catch (error) {
    console.error("Error saving availability settings", error);
    return { error: ErrorMessages("failedToSaveAvailableTimes") };
  }
};

export const saveRecurringAvailableTimes = async (
  values: z.infer<typeof RecurringAvailabilitySchema>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    const validatedFields = RecurringAvailabilitySchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
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

    revalidatePath("/therapist/availability");

    return { success: SuccessMessages("availableTimesSaved") };
  } catch (error) {
    console.error("Error saving available times", error);
    return { error: ErrorMessages("failedToSaveAvailableTimes") };
  }
};
