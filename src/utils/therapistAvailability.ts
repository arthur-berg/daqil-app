import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

type TimeRange = {
  startTime: string | Date;
  endTime: string | Date;
  appointmentTypeIds?: string[];
};

type BlockedTimeRange = {
  startDate: string;
  endDate: string;
};

type BlockedTime = {
  date: string;
  timeRanges: BlockedTimeRange[];
};

type NonRecurringTimeRange = {
  startDate: string | Date;
  endDate: string | Date;
};

type AvailableTimes = {
  settings: {
    interval: number;
    futureBookingDelay?: number;
  };
  blockedOutTimes: BlockedTime[];
  nonRecurringAvailableTimes: {
    date: string;
    timeRanges: NonRecurringTimeRange[];
  }[];
  recurringAvailableTimes: { day: string; timeRanges: TimeRange[] }[];
};

type AppointmentType = {
  _id: string;
  durationInMinutes: number;
};

type TimeSlot = {
  start: Date;
  end: Date;
};

const filterTimeRangesByAppointmentType = (
  timeRanges: TimeRange[],
  appointmentTypeId: string
) => {
  return timeRanges.filter((range) => {
    return range.appointmentTypeIds
      ?.map(String)
      .includes(String(appointmentTypeId));
  });
};

function safeFormat(date: Date, dateFormat: string) {
  return isNaN(date.getTime()) ? null : format(date, dateFormat);
}

export const getTherapistAvailableTimeSlots = (
  availableTimes: AvailableTimes,
  appointmentType: AppointmentType,
  selectedDate: Date,
  appointments: any[],
  timeZone: string
): TimeSlot[] => {
  const {
    settings,
    blockedOutTimes,
    nonRecurringAvailableTimes,
    recurringAvailableTimes,
  } = availableTimes;
  const { interval, futureBookingDelay } = settings;
  const appointmentDate = formatInTimeZone(selectedDate, "UTC", "yyyy-MM-dd");

  const normalizeToUTC = (date: any) => {
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        0,
        0
      )
    );
  };

  const normalizedSelectedDate = normalizeToUTC(new Date(selectedDate));

  const selectedAppointment = appointments.find(
    (appointment) => appointment.date === appointmentDate
  );

  const bookedAppointments = selectedAppointment
    ? selectedAppointment.bookedAppointments.filter(
        (appointment: any) => appointment.status !== "canceled"
      )
    : [];

  const validTemporarilyReservedAppointments = selectedAppointment
    ? selectedAppointment.temporarilyReservedAppointments.filter(
        (appointment: any) =>
          appointment?.payment?.paymentExpiryDate &&
          new Date(appointment.payment.paymentExpiryDate) > new Date()
      )
    : [];
  const allAppointmentsForDate = [
    ...bookedAppointments,
    ...validTemporarilyReservedAppointments,
  ];

  const appointmentsForDate = allAppointmentsForDate.map((appointment: any) => {
    const start = new Date(appointment.startDate);
    const end = new Date(appointment.endDate);

    return {
      startTime: safeFormat(start, "HH:mm"),
      endTime: safeFormat(end, "HH:mm"),
    };
  });

  const getBlockedOutTimesForDate = (): BlockedTimeRange[] => {
    let timeRanges: any = [];
    blockedOutTimes?.forEach((nonRecurring) => {
      nonRecurring.timeRanges.map((range: any) => {
        timeRanges.push({
          startDate: new Date(range.startDate),
          endDate: new Date(range.endDate),
        });
      });
    });
    return timeRanges;
  };

  const getNonRecurringAvailableTimesForDate = (): any[] => {
    let timeRanges: any = [];
    nonRecurringAvailableTimes?.forEach((nonRecurring) => {
      nonRecurring.timeRanges.map((range: any) => {
        timeRanges.push({
          startDate: new Date(range.startDate),
          endDate: new Date(range.endDate),
          appointmentTypeIds: range.appointmentTypeIds,
        });
      });
    });
    return timeRanges;
  };

  const generateRecurringTimeIntervals = (
    recurringRange: TimeRange,
    selectedDate: Date,
    interval: number
  ): Date[] => {
    const originalStart = new Date(recurringRange.startTime);
    const originalEnd = new Date(recurringRange.endTime);

    return generateTimeIntervals(
      originalStart,
      originalEnd,
      interval,
      selectedDate
    );
  };

  const generateTimeIntervals = (
    start: Date,
    end: Date,
    interval: number,
    selectedDate: Date
  ): Date[] => {
    const times: Date[] = [];

    // Ensure the start is before the end
    if (!isBefore(start, end)) {
      console.log("Invalid range: Start is not before End");
      return [];
    }

    let current = new Date(start);

    // Get the day name for the selected date
    const selectedDayName = formatInTimeZone(selectedDate, timeZone, "EEEE");

    // Generate intervals and filter by day name
    while (isBefore(current, end)) {
      const adjustedStart = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
          current.getUTCHours(),
          current.getUTCMinutes(),
          current.getUTCSeconds()
        )
      );
      times.push(new Date(adjustedStart));
      current = addMinutes(current, interval);
    }
    const filteredTimes = times
      .map((time) => {
        const slotDayName = formatInTimeZone(time, timeZone, "EEEE");
        if (slotDayName === selectedDayName) {
          const adjustedStart = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()
          );
          return adjustedStart;
        }
      })
      .filter(Boolean);

    return filteredTimes as any;
  };

  const nonRecurringTimeRanges = getNonRecurringAvailableTimesForDate();

  const formattedNonRecurringTimeRanges = nonRecurringTimeRanges.map(
    (range) => ({
      startTime: range.startDate,
      endTime: range.endDate,
    })
  );

  const blockedTimes = [
    ...getBlockedOutTimesForDate(),
    ...appointmentsForDate.map((range: any) => ({
      startDate: new Date(`${appointmentDate}T${range.startTime}:00`),
      endDate: new Date(`${appointmentDate}T${range.endTime}:00`),
    })),
  ];

  const now = new Date();

  let availableTimeSlots: any = [];

  recurringAvailableTimes.forEach((recurring) => {
    recurring.timeRanges.forEach((range) => {
      const intervals = generateRecurringTimeIntervals(
        range,
        selectedDate,
        interval
      );
      availableTimeSlots = [...availableTimeSlots, ...intervals];
    });
  });

  formattedNonRecurringTimeRanges.forEach((range) => {
    const intervals = generateRecurringTimeIntervals(
      range,
      selectedDate,
      interval
    );

    availableTimeSlots = [...availableTimeSlots, ...intervals];
  });

  const filterAvailableTimeSlotsBySelectedDate = (
    availableTimeSlots: Date[]
  ): Date[] => {
    // Get the day name for the selected date in the local timezone

    const selectedDayName = formatInTimeZone(selectedDate, timeZone, "EEEE");

    return availableTimeSlots.filter((slot) => {
      const slotDayName = formatInTimeZone(slot, timeZone, "EEEE");

      const matchesDayName = slotDayName === selectedDayName;

      return matchesDayName;
    });
  };

  const filteredAvailableTimeSlots =
    filterAvailableTimeSlotsBySelectedDate(availableTimeSlots);

  const filteredAvailableTimes = filteredAvailableTimeSlots.filter((time) => {
    const intervalEnd = addMinutes(time, interval);
    const intervalEndAdjusted = addMinutes(
      time,
      appointmentType.durationInMinutes
    );

    const isTimeInPast = isBefore(time, now);
    const delay = futureBookingDelay ?? 360;
    const isTimeTooSoon = isBefore(time, addMinutes(now, delay));

    return (
      !isTimeInPast &&
      !isTimeTooSoon &&
      !blockedTimes.some((blocked) => {
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

        return (
          startsWithinBlockedRange ||
          endsWithinBlockedRange ||
          spansBlockedRange ||
          endAdjustedWithinBlockedRange
        );
      })
    );
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

export const getTherapistBookedTimeSlots = (
  selectedDate: Date,
  appointments: any[]
): TimeSlot[] => {
  const appointmentDate = formatInTimeZone(selectedDate, "UTC", "yyyy-MM-dd");

  const selectedAppointment = appointments.find(
    (appointment) => appointment.date === appointmentDate
  );

  const bookedAppointments = selectedAppointment
    ? selectedAppointment.bookedAppointments.filter(
        (appointment: any) => appointment.status !== "canceled"
      )
    : [];

  const validTemporarilyReservedAppointments = selectedAppointment
    ? selectedAppointment.temporarilyReservedAppointments.filter(
        (appointment: any) =>
          appointment?.payment?.paymentExpiryDate &&
          new Date(appointment.payment.paymentExpiryDate) > new Date()
      )
    : [];

  const allAppointmentsForDate = [
    ...bookedAppointments,
    ...validTemporarilyReservedAppointments,
  ];

  const appointmentsForDate = allAppointmentsForDate.map((appointment: any) => {
    const start = new Date(appointment.startDate);
    const end = new Date(appointment.endDate);

    return {
      startTime: safeFormat(start, "HH:mm"),
      endTime: safeFormat(end, "HH:mm"),
    };
  });

  const timeBlocks = appointmentsForDate.map((range) => {
    const startTime = new Date(`${appointmentDate}T${range.startTime}:00`);
    const endTime = new Date(`${appointmentDate}T${range.endTime}:00`);
    return {
      start: startTime,
      end: endTime,
    };
  });

  return timeBlocks;
};
