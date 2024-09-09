"use server";

import * as z from "zod";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import {
  RecurringAvailabilitySchema,
  RecurringAvailabilitySettingsSchemaBE,
  NonRecurringAvailabilitySchemaBE,
  BlockAvailabilitySchemaBE,
} from "@/schemas";
import { getTranslations } from "next-intl/server";
import { isSameDay } from "date-fns";
import { revalidatePath } from "next/cache";
import connectToMongoDB from "@/lib/mongoose";

export const removeNonRecurringDate = async (selectedDate: Date) => {
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

    const filteredAvailableTimes =
      user.availableTimes.nonRecurringAvailableTimes?.filter(
        (nonRecurringTime: any) =>
          !isSameDay(new Date(nonRecurringTime.date), new Date(selectedDate))
      ) ?? [];

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.nonRecurringAvailableTimes": filteredAvailableTimes,
    });

    revalidatePath("/therapist/availability");

    return { success: SuccessMessages("nonRecurringDateRemoved") };
  } catch (error) {
    console.error("Error removing non-recurring date", error);
    return { error: ErrorMessages("failedToRemoveNonRecurringDate") };
  }
};

export const removeBlockedDate = async (selectedDate: Date) => {
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

    const filteredBlockedOutTimes =
      user.availableTimes.blockedOutTimes?.filter(
        (blockedOutTime: any) =>
          !isSameDay(new Date(blockedOutTime.date), new Date(selectedDate))
      ) ?? [];

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.blockedOutTimes": filteredBlockedOutTimes,
    });

    revalidatePath("/therapist/availability");

    return { success: SuccessMessages("blockedDateRemoved") };
  } catch (error) {
    console.error("Error removing blocked date", error);
    return { error: ErrorMessages("failedToRemoveBlockedDate") };
  }
};

export const saveBlockedOutTimes = async (
  values: z.infer<typeof BlockAvailabilitySchemaBE>
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
    console.error("Error saving non-recurring available times", error);
    return { error: ErrorMessages("failedToSaveNonRecurringTimes") };
  }
};

export const saveNonRecurringAvailableTimes = async (
  values: z.infer<typeof NonRecurringAvailabilitySchemaBE>
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

    const validatedFields = NonRecurringAvailabilitySchemaBE.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    const data = validatedFields.data;

    const filteredAvailableTimes =
      user.availableTimes.nonRecurringAvailableTimes?.filter(
        (availableTime: any) =>
          !isSameDay(new Date(availableTime.date), new Date(data.date))
      ) ?? [];

    const mergedNonRecurringTimes = [...filteredAvailableTimes, data];

    await User.findByIdAndUpdate(user.id, {
      "availableTimes.nonRecurringAvailableTimes": mergedNonRecurringTimes,
    });

    revalidatePath("/therapist/availability");

    return { success: SuccessMessages("nonRecurringTimesSaves") };
  } catch (error) {
    console.error("Error saving non-recurring available times", error);
    return { error: ErrorMessages("failedToSaveNonRecurringTimes") };
  }
};

export const updateRecurringAvailabilitySettings = async (
  values: z.infer<typeof RecurringAvailabilitySettingsSchemaBE>
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

    const validatedFields =
      RecurringAvailabilitySettingsSchemaBE.safeParse(values);

    if (!validatedFields.success) {
      return { error: ErrorMessages("invalidFields") };
    }

    await User.findByIdAndUpdate(user.id, {
      $set: {
        "availableTimes.settings.interval": values.interval,
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
