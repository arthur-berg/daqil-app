export const UserRole = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  THERAPIST: "THERAPIST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Schema types

export type TimeRange = {
  startDate?: Date;
  endDate?: Date;
};

export type TimeRangeStrings = {
  startTime?: string;
  endTime?: string;
};

export type DateTimes = {
  date?: Date;
  timeRanges: TimeRange[];
};

export type DayTimes = {
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
