import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  set,
} from "date-fns";

type TimeRange = {
  startTime: string;
  endTime: string;
};

type BlockedTime = {
  startDate: string;
  endDate: string;
};

type SpecificTimeRange = {
  startDate: Date;
  endDate: Date;
};

type AvailableTimes = {
  settings: {
    interval: number;
    fullDayRange: { startTime: string; endTime: string };
  };
  blockedOutTimes: BlockedTime[];
  specificAvailableTimes: { date: string; timeRanges: SpecificTimeRange[] }[];
  recurringAvailableTimes: { day: string; timeRanges: TimeRange[] }[];
};

type AppointmentType = {
  durationInMinutes: number;
};

type TimeSlot = {
  start: Date;
  end: Date;
};

export const getTherapistAvailableTimeSlots = (
  availableTimes: AvailableTimes,
  appointmentType: AppointmentType,
  selectedDate: Date
): TimeSlot[] => {
  const {
    settings,
    blockedOutTimes,
    specificAvailableTimes,
    recurringAvailableTimes,
  } = availableTimes;
  const { interval } = settings;

  const getTimeRangesForDay = (day: string): TimeRange[] => {
    const recurring = recurringAvailableTimes.find((r) => r.day === day);
    return recurring ? recurring.timeRanges : [];
  };

  const getBlockedOutTimesForDate = (date: Date): BlockedTime[] => {
    const blocked = blockedOutTimes.find((b) =>
      isSameDay(
        new Date(b.startDate).setHours(0, 0, 0, 0),
        date.setHours(0, 0, 0, 0)
      )
    );
    return blocked ? [blocked] : [];
  };

  const getSpecificAvailableTimesForDate = (
    date: Date
  ): SpecificTimeRange[] => {
    const specific = specificAvailableTimes.find((s) =>
      isSameDay(
        new Date(s.date).setHours(0, 0, 0, 0),
        date.setHours(0, 0, 0, 0)
      )
    );
    return specific ? specific.timeRanges : [];
  };

  const generateTimeIntervals = (
    start: string,
    end: string,
    interval: number,
    date: Date
  ): Date[] => {
    if (!start || !end) return [];

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const startTime = set(new Date(date), {
      hours: startHour,
      minutes: startMinute,
      seconds: 0,
      milliseconds: 0,
    });
    const endTime = set(new Date(date), {
      hours: endHour,
      minutes: endMinute,
      seconds: 0,
      milliseconds: 0,
    });

    const times: Date[] = [];
    let current = startTime;
    while (isBefore(current, endTime)) {
      times.push(current);
      current = addMinutes(current, interval);
    }
    return times;
  };

  const dayOfWeek = format(selectedDate, "EEEE").toLowerCase();
  let timeRanges = getTimeRangesForDay(dayOfWeek);

  const specificTimeRanges = getSpecificAvailableTimesForDate(selectedDate);

  const formattedSpecificTimeRanges = specificTimeRanges.map((range) => ({
    startTime: format(new Date(range.startDate), "HH:mm"),
    endTime: format(new Date(range.endDate), "HH:mm"),
  }));

  timeRanges = [...timeRanges, ...formattedSpecificTimeRanges].sort(
    (a, b) =>
      new Date(`1970-01-01T${a.startTime}:00Z`).getTime() -
      new Date(`1970-01-01T${b.startTime}:00Z`).getTime()
  );

  const blockedTimes = getBlockedOutTimesForDate(selectedDate);

  const availableTimeSlots = timeRanges.reduce<Date[]>((acc, range) => {
    const intervals = generateTimeIntervals(
      range.startTime,
      range.endTime,
      interval,
      selectedDate
    );
    return [...acc, ...intervals];
  }, []);

  const filteredAvailableTimes = availableTimeSlots.filter((time) => {
    const intervalEnd = addMinutes(time, interval);
    const intervalEndAdjusted = addMinutes(
      time,
      appointmentType.durationInMinutes
    );

    return !blockedTimes.some((blocked) => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);

      const startsWithinBlockedRange =
        (isAfter(time, blockedStart) || isEqual(time, blockedStart)) &&
        (isBefore(time, blockedEnd) || isEqual(time, blockedEnd));

      const endsWithinBlockedRange =
        (isAfter(intervalEnd, blockedStart) ||
          isEqual(intervalEnd, blockedStart)) &&
        (isBefore(intervalEnd, blockedEnd) || isEqual(intervalEnd, blockedEnd));

      const spansBlockedRange =
        (isBefore(time, blockedStart) || isEqual(time, blockedStart)) &&
        (isAfter(intervalEnd, blockedEnd) || isEqual(intervalEnd, blockedEnd));

      const endAdjustedWithinBlockedRange =
        (isAfter(intervalEndAdjusted, blockedStart) ||
          isEqual(intervalEndAdjusted, blockedStart)) &&
        (isBefore(intervalEndAdjusted, blockedEnd) ||
          isEqual(intervalEndAdjusted, blockedEnd));

      const overlaps =
        startsWithinBlockedRange ||
        endsWithinBlockedRange ||
        spansBlockedRange ||
        endAdjustedWithinBlockedRange;

      return overlaps;
    });
  });

  const transformTimes = (
    times: Date[],
    durationInMinutes: number
  ): TimeSlot[] => {
    return times.map((time) => {
      const endTime = addMinutes(time, durationInMinutes);
      return {
        start: time,
        end: endTime,
      };
    });
  };

  const timeBlocks = transformTimes(
    filteredAvailableTimes,
    appointmentType.durationInMinutes
  );

  return timeBlocks;
};
