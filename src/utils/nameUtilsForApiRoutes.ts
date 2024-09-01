import { getCurrentUser } from "@/lib/auth";

// Function to resolve the first name based on the provided locale
export const getFirstName = (
  firstName: { en: string; ar?: string },
  locale: string
): string => {
  if (locale === "ar" && firstName.ar && firstName.ar.trim() !== "") {
    return firstName.ar;
  }
  return firstName.en;
};

// Function to resolve the last name based on the provided locale
export const getLastName = (
  lastName: { en: string; ar?: string },
  locale: string
): string => {
  if (locale === "ar" && lastName.ar && lastName.ar.trim() !== "") {
    return lastName.ar;
  }
  return lastName.en;
};

// Function to resolve the full name based on the provided locale
export const getFullName = (
  firstName: { en: string; ar?: string },
  lastName: { en: string; ar?: string },
  locale: string
): string => {
  const resolvedFirstName = getFirstName(firstName, locale);
  const resolvedLastName = getLastName(lastName, locale);

  return `${resolvedFirstName} ${resolvedLastName}`;
};

// Function to get the current user's first name using the provided locale
export const getCurrentUserFirstName = async (
  locale: string
): Promise<string> => {
  const user = await getCurrentUser();
  if (!user || !user.firstName) {
    return ""; // Or handle the case where the user is not available
  }

  return getFirstName(user.firstName, locale);
};

// Function to get the current user's last name using the provided locale
export const getCurrentUserLastName = async (
  locale: string
): Promise<string> => {
  const user = await getCurrentUser();
  if (!user || !user.lastName) {
    return ""; // Or handle the case where the user is not available
  }

  return getLastName(user.lastName, locale);
};

// Function to get the current user's full name using the provided locale
export const getCurrentUserFullName = async (
  locale: string
): Promise<string> => {
  const user = await getCurrentUser();
  if (!user || !user.firstName || !user.lastName) {
    return ""; // Or handle the case where the user is not available
  }

  return getFullName(user.firstName, user.lastName, locale);
};
