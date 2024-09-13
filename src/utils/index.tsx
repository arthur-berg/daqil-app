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

export function convertToUtcMidnight(selectedDate: Date): Date {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();

  return new Date(Date.UTC(year, month, day, 0, 0, 0));
}

export function convertToUtcWithTime(selectedDate: Date): Date {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();
  const hours = selectedDate.getHours();
  const minutes = selectedDate.getMinutes();

  return new Date(Date.UTC(year, month, day, hours, minutes, 0));
}

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

export const convertToSubcurrency = (amount: number, factor = 100) => {
  return Math.round(amount * factor);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
