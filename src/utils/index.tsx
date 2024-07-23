import { format } from "date-fns";

export const currencyToSymbol = (currency: "USD" | "AED" | "EUR") => {
  if (currency === "USD") {
    return "$";
  } else if (currency === "AED") {
    return "د.إ";
  } else if (currency === "EUR") {
    return "€";
  } else {
    return "";
  }
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const generatePassword = (length = 12) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

export const formatDateTime = (date: Date): string =>
  format(new Date(date), "HH:mm");
