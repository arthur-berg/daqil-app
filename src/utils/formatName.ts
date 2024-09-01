import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "next-intl/server";

export const getFirstName = async (firstName: { en: string; ar?: string }) => {
  const locale = await getLocale();
  if (locale === "ar" && firstName.ar && firstName.ar.trim() !== "") {
    return firstName.ar;
  }
  return firstName.en;
};

export const getLastName = async (lastName: { en: string; ar?: string }) => {
  const locale = await getLocale();

  if (locale === "ar" && lastName.ar && lastName.ar.trim() !== "") {
    return lastName.ar;
  }
  return lastName.en;
};

export const getFullName = async (
  firstName: { en: string; ar?: string },
  lastName: { en: string; ar?: string }
) => {
  const resolvedFirstName = await getFirstName(firstName);
  const resolvedLastName = await getLastName(lastName);

  return `${resolvedFirstName} ${resolvedLastName}`;
};

export const getCurrentUserFirstName = async () => {
  const user = await getCurrentUser();
  if (!user || !user.firstName) {
    return ""; // Or handle the case where the user is not available
  }

  return await getFirstName(user.firstName);
};

export const getCurrentUserLastName = async () => {
  const user = await getCurrentUser();
  if (!user || !user.lastName) {
    return ""; // Or handle the case where the user is not available
  }

  return await getLastName(user.lastName);
};

export const getCurrentUserFullName = async () => {
  const user = await getCurrentUser();
  if (!user || !user.firstName || !user.lastName) {
    return ""; // Or handle the case where the user is not available
  }

  const fullName = await getFullName(user.firstName, user.lastName);

  return fullName;
};
