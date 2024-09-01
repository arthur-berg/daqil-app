export const getFirstName = (
  firstName: { en: string; ar?: string },
  locale: string
): string => {
  if (locale === "ar" && firstName.ar && firstName.ar.trim() !== "") {
    return firstName.ar;
  }
  return firstName.en;
};

export const getLastName = (
  lastName: { en: string; ar?: string },
  locale: string
): string => {
  if (locale === "ar" && lastName.ar && lastName.ar.trim() !== "") {
    return lastName.ar;
  }
  return lastName.en;
};

export const getFullName = (
  firstName: { en: string; ar?: string },
  lastName: { en: string; ar?: string },
  locale: string
): string => {
  const resolvedFirstName = getFirstName(firstName, locale);
  const resolvedLastName = getLastName(lastName, locale);

  return `${resolvedFirstName} ${resolvedLastName}`;
};
