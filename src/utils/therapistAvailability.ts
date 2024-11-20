import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

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
  appointments: any[]
): TimeSlot[] => {
  const {
    settings,
    blockedOutTimes,
    nonRecurringAvailableTimes,
    recurringAvailableTimes,
  } = availableTimes;
  const { interval, futureBookingDelay } = settings;
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

  const getTimeRangesForDay = (day: string): TimeRange[] => {
    const recurring = recurringAvailableTimes.find(
      (r) => r.day.toLowerCase() === day
    );
    return recurring
      ? filterTimeRangesByAppointmentType(
          recurring.timeRanges.map((range) => ({
            ...range,
            startTime: new Date(range.startTime),
            endTime: new Date(range.endTime),
          })),
          appointmentType._id
        )
      : [];
  };

  const getBlockedOutTimesForDate = (date: Date): BlockedTimeRange[] => {
    const blocked = blockedOutTimes.find((b) =>
      isSameDay(new Date(b.date), date)
    );

    const timeRanges = blocked?.timeRanges.map((timeRange) => {
      return {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      };
    });
    return timeRanges ? timeRanges : [];
  };

  const getNonRecurringAvailableTimesForDate = (
    date: Date
  ): NonRecurringTimeRange[] => {
    const nonRecurring = nonRecurringAvailableTimes.find((s) =>
      isSameDay(new Date(s.date), date)
    );
    return nonRecurring ? nonRecurring.timeRanges : [];
  };

  const generateTimeIntervals = (
    start: Date,
    end: Date,
    interval: number,
    selectedDate: Date
  ): Date[] => {
    const times: Date[] = [];

    // Align `start` and `end` with UTC
    const adjustedStart = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        start.getUTCHours(),
        start.getUTCMinutes()
      )
    );

    const adjustedEnd = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        end.getUTCHours(),
        end.getUTCMinutes()
      )
    );

    // Handle midnight crossing
    if (isBefore(adjustedEnd, adjustedStart)) {
      adjustedEnd.setUTCDate(adjustedEnd.getUTCDate() + 1);
    }

    // Validate range
    if (!isBefore(adjustedStart, adjustedEnd)) {
      console.log("Invalid range: Start is not before End");
      return [];
    }

    let current = adjustedStart;

    // Generate intervals
    while (isBefore(current, adjustedEnd)) {
      times.push(new Date(current)); // Push new instance to avoid mutation issues
      current = addMinutes(current, interval); // Increment current time
    }

    return times;
  };

  const dayOfWeek = formatInTimeZone(selectedDate, "UTC", "EEEE").toLowerCase();
  let timeRanges = getTimeRangesForDay(dayOfWeek);

  const nonRecurringTimeRanges =
    getNonRecurringAvailableTimesForDate(selectedDate);

  const formattedNonRecurringTimeRanges = nonRecurringTimeRanges.map(
    (range) => ({
      startTime: new Date(range.startDate),
      endTime: new Date(range.endDate),
    })
  );

  timeRanges = [...timeRanges, ...formattedNonRecurringTimeRanges].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const blockedTimes = [
    ...getBlockedOutTimesForDate(selectedDate),
    ...appointmentsForDate.map((range: any) => ({
      startDate: new Date(`${appointmentDate}T${range.startTime}:00`),
      endDate: new Date(`${appointmentDate}T${range.endTime}:00`),
    })),
  ];

  const now = new Date();

  const availableTimeSlots = timeRanges.reduce<Date[]>((acc, range) => {
    const intervals = generateTimeIntervals(
      new Date(range.startTime),
      new Date(range.endTime),
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

    const isTimeInPast = isBefore(time, now);
    const delay = futureBookingDelay ?? 60;
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
