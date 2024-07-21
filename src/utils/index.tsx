import {
  addDays,
  addMinutes,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isWithinInterval,
  parseISO,
  set,
} from "date-fns";

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

export const getTherapistAvailableTimes = (availableTimes) => {
  const {
    settings,
    blockedOutTimes,
    specificAvailableTimes,
    recurringAvailableTimes,
  } = availableTimes;
  const { interval, fullDayRange } = settings;

  const oneWeekFromNow = addDays(new Date(), 7);

  const allDatesInNextWeek = eachDayOfInterval({
    start: new Date(),
    end: oneWeekFromNow,
  });

  const getTimeRangesForDay = (day) => {
    const recurring = recurringAvailableTimes.find((r) => r.day === day);
    return recurring ? recurring.timeRanges : [];
  };

  const getBlockedOutTimesForDate = (date) => {
    const blocked = blockedOutTimes.find((b) =>
      isSameDay(
        new Date(b.date).setHours(0, 0, 0, 0),
        date.setHours(0, 0, 0, 0)
      )
    );
    console.log(
      `Blocked times for ${date}:`,
      blocked ? blocked.timeRanges : []
    );
    return blocked ? blocked.timeRanges : [];
  };

  const getSpecificAvailableTimesForDate = (date) => {
    const specific = specificAvailableTimes.find((s) =>
      isSameDay(
        new Date(s.date).setHours(0, 0, 0, 0),
        date.setHours(0, 0, 0, 0)
      )
    );
    return specific ? specific.timeRanges : [];
  };

  const generateTimeIntervals = (start, end, interval, date) => {
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

    const times = [];
    let current = startTime;
    while (isBefore(current, endTime)) {
      console.log(
        `Generated interval: ${current} to ${addMinutes(current, interval)}`
      );
      times.push(current);
      current = addMinutes(current, interval);
    }
    return times;
  };

  const allAvailableTimes = allDatesInNextWeek.map((date) => {
    const dayOfWeek = format(date, "EEEE").toLowerCase();
    let timeRanges = getTimeRangesForDay(dayOfWeek);

    const specificTimeRanges = getSpecificAvailableTimesForDate(date);
    if (specificTimeRanges.length > 0) {
      timeRanges = specificTimeRanges;
    }

    const blockedTimes = getBlockedOutTimesForDate(date);

    const availableTimes = timeRanges.reduce((acc, range) => {
      const intervals = generateTimeIntervals(
        range.startTime,
        range.endTime,
        interval,
        date
      );
      return [...acc, ...intervals];
    }, []);

    const filteredAvailableTimes = availableTimes.filter((time) => {
      const intervalEnd = addMinutes(time, interval);
      const intervalEndAdjusted = addMinutes(time, 45); // Adjusting interval end time by 45 minutes

      return !blockedTimes.some((blocked) => {
        const blockedStart = new Date(blocked.startDate);
        const blockedEnd = new Date(blocked.endDate);

        const startsWithinBlockedRange =
          (isAfter(time, blockedStart) || isEqual(time, blockedStart)) &&
          (isBefore(time, blockedEnd) || isEqual(time, blockedEnd));

        const endsWithinBlockedRange =
          (isAfter(intervalEnd, blockedStart) ||
            isEqual(intervalEnd, blockedStart)) &&
          (isBefore(intervalEnd, blockedEnd) ||
            isEqual(intervalEnd, blockedEnd));

        const spansBlockedRange =
          (isBefore(time, blockedStart) || isEqual(time, blockedStart)) &&
          (isAfter(intervalEnd, blockedEnd) ||
            isEqual(intervalEnd, blockedEnd));

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

        console.log(`Checking time: ${time} - intervalEnd: ${intervalEnd}`);
        console.log(`Blocked range: ${blockedStart} - ${blockedEnd}`);
        console.log(`Starts within blocked range: ${startsWithinBlockedRange}`);
        console.log(`Ends within blocked range: ${endsWithinBlockedRange}`);
        console.log(`Spans blocked range: ${spansBlockedRange}`);
        console.log(
          `End adjusted within blocked range: ${endAdjustedWithinBlockedRange}`
        );
        console.log(`Overlaps: ${overlaps}`);

        return overlaps;
      });
    });

    return {
      date,
      availableTimes: filteredAvailableTimes.map((time) =>
        format(time, "HH:mm")
      ),
    };
  });

  return allAvailableTimes;
};
