export const UserRole = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  THERAPIST: "THERAPIST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Schema types

type TimeRange = {
  startDate?: Date;
  endDate?: Date;
};

type TimeRangeStrings = {
  startTime?: string;
  endTime?: string;
};

type DateTimes = {
  date?: Date;
  timeRanges: TimeRange[];
};

type DayTimes = {
  day?: string;
  timeRanges: TimeRangeStrings[];
};

export type AvailableTimes = {
  settings: {
    interval?: number;
    fullDayRange: {
      from?: string;
      to?: string;
    };
  };
  blockedOutTimes: DateTimes[];
  specificAvailableTimes: DateTimes[];
  recurringAvailableTimes: DayTimes[];
};
