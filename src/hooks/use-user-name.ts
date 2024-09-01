import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

export const useUserName = (
  providedFirstName?: { en: string; ar?: string },
  providedLastName?: { en: string; ar?: string }
) => {
  const locale = useLocale();
  const { data: session } = useSession();

  const resolveFirstName = (firstName: { en: string; ar?: string }): string => {
    if (locale === "ar" && firstName.ar && firstName.ar.trim() !== "") {
      return firstName.ar;
    }
    return firstName.en;
  };

  const resolveLastName = (lastName: { en: string; ar?: string }): string => {
    if (locale === "ar" && lastName.ar && lastName.ar.trim() !== "") {
      return lastName.ar;
    }
    return lastName.en;
  };

  const resolveFullName = (
    firstName: { en: string; ar?: string },
    lastName: { en: string; ar?: string }
  ): string => {
    const resolvedFirstName = resolveFirstName(firstName);
    const resolvedLastName = resolveLastName(lastName);
    return `${resolvedFirstName} ${resolvedLastName}`;
  };

  // Determine which first and last name to use: provided or from session
  const firstName = providedFirstName ?? session?.user?.firstName;
  const lastName = providedLastName ?? session?.user?.lastName;

  if (!firstName || !lastName) {
    return {
      firstName: "",
      lastName: "",
      fullName: "",
      getFirstName: () => "",
      getLastName: () => "",
      getFullName: () => "",
    };
  }

  return {
    firstName: resolveFirstName(firstName),
    lastName: resolveLastName(lastName),
    fullName: resolveFullName(firstName, lastName),
    getFirstName: (firstName: { en: string; ar?: string }): string => {
      if (!firstName) return "";
      return resolveFirstName(firstName);
    },
    getLastName: (lastName: { en: string; ar?: string }): string => {
      if (!lastName) return "";
      return resolveLastName(lastName);
    },
    getFullName: (
      firstName: { en: string; ar?: string },
      lastName: { en: string; ar?: string }
    ): string => {
      if (!firstName || !lastName) return "";
      return resolveFullName(firstName, lastName);
    },
  };
};
