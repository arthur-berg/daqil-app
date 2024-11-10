export const getTimeZoneOffset = (timeZone: string): string => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName");
  return offsetPart ? offsetPart.value.replace("GMT", "UTC") : "UTC";
};

export const formatTimeZoneWithOffset = (timeZone: string): string => {
  // Handle "Etc/GMT" as "UTC+0:00"
  if (timeZone === "Etc/GMT" || timeZone.startsWith("Etc/GMT")) {
    return "(UTC+0:00) UTC";
  }

  // If the timeZone already includes "UTC", return it as is
  if (timeZone.includes("UTC")) {
    return timeZone;
  }

  // Otherwise, format it with the offset
  return `${timeZone} ${getTimeZoneOffset(timeZone)}`;
};

export const getUTCOffset = (timeZone: string): string => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName");

  // Convert "GMT" to "UTC" and remove additional text
  return offsetPart ? offsetPart.value.replace("GMT", "UTC") : "UTC";
};
