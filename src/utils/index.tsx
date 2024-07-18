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
