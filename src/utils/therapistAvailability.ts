import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  set,
} from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

type TimeRange = {
  startTime: string;
  endTime: string;
  appointmentTypeIds?: string[];
};

type BlockedTime = {
  startDate: string;
  endDate: string;
};

type NonRecurringTimeRange = {
  startDate: Date;
  endDate: Date;
};

type AvailableTimes = {
  settings: {
    interval: number;
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
  return timeRanges.filter((range) =>
    range.appointmentTypeIds?.includes(appointmentTypeId)
  );
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

  const { interval } = settings;

  const appointmentDate = format(selectedDate, "yyyy-MM-dd");

  const selectedAppointment = appointments.find(
    (appointment) => appointment.date === appointmentDate
  );

  // Filter booked appointments that are not canceled
  const bookedAppointments = selectedAppointment
    ? selectedAppointment.bookedAppointments.filter(
        (appointment: any) => appointment.status !== "canceled"
      )
    : [];

  // Include only valid temporarily reserved appointments (not expired)
  const validTemporarilyReservedAppointments = selectedAppointment
    ? selectedAppointment.temporarilyReservedAppointments.filter(
        (appointment: any) =>
          new Date(appointment.payment.paymentExpiryDate) > new Date()
      )
    : [];

  // Combine both booked and valid temporarily reserved appointments
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
    const recurring = recurringAvailableTimes.find((r) => r.day === day);
    return recurring
      ? filterTimeRangesByAppointmentType(
          recurring.timeRanges,
          appointmentType._id
        )
      : [];
  };

  const getBlockedOutTimesForDate = (date: Date): BlockedTime[] => {
    const blocked = blockedOutTimes.find((b) =>
      isSameDay(new Date(b.startDate), date)
    );
    return blocked ? [blocked] : [];
  };

  const getNonRecurringAvailableTimesForDate = (
    date: Date
  ): NonRecurringTimeRange[] => {
    const nonRecurring = nonRecurringAvailableTimes.find((s) =>
      isSameDay(new Date(s.date), date)
    );
    console.log("nonRecurringAvailableTimes", nonRecurringAvailableTimes);
    
    console.log("nonRecurring", nonRecurring);
    return nonRecurring ? nonRecurring.timeRanges : [];
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

  const nonRecurringTimeRanges =
    getNonRecurringAvailableTimesForDate(selectedDate);

  const formattedNonRecurringTimeRanges = nonRecurringTimeRanges.map(
    (range) => ({
      startTime: format(new Date(range.startDate), "HH:mm"),
      endTime: format(new Date(range.endDate), "HH:mm"),
    })
  );

  timeRanges = [...timeRanges, ...formattedNonRecurringTimeRanges].sort(
    (a, b) =>
      new Date(`1970-01-01T${a.startTime}:00Z`).getTime() -
      new Date(`1970-01-01T${b.startTime}:00Z`).getTime()
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

    const isTimeInPast = isBefore(time, now);

    return (
      !isTimeInPast &&
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

        const overlaps =
          startsWithinBlockedRange ||
          endsWithinBlockedRange ||
          spansBlockedRange ||
          endAdjustedWithinBlockedRange;

        return overlaps;
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
