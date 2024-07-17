"use server";

import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";

export const saveDefaultAvailableTimes = async (availableTimes: any) => {
  try {
    const user = (await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
    ])) as any;

    if (!user.availableTimes) {
      user.availableTimes = {
        blockedOutTimes: [],
        specificAvailableTimes: [],
        defaultAvailableTimes: [],
      };
    }

    const filteredAvailableTimes =
      user.availableTimes.defaultAvailableTimes?.filter(
        (defaultAvailableTime: any) =>
          defaultAvailableTime.day !== availableTimes.day
      ) ?? {};

    const mergedDefaultTimes = [...filteredAvailableTimes, availableTimes];

    user.availableTimes.defaultAvailableTimes = mergedDefaultTimes;

    await User.findByIdAndUpdate(user.id, {
      availableTimes: user.availableTimes,
    });

    return { success: "Available times saved successfully." };
  } catch (error) {
    console.error("Error saving available times", error);
    return { error: "Failed to save available times." };
  }
};
