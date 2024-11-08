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
  return `${timeZone} ${getTimeZoneOffset(timeZone)}`;
};
