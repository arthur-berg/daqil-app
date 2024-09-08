import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
} from "date-fns";

type TimeRange = {
  startTime: string | Date;
  endTime: string | Date;
  appointmentTypeIds?: string[];
};

type BlockedTime = {
  startDate: string;
  endDate: string;
};

type NonRecurringTimeRange = {
  startDate: string | Date;
  endDate: string | Date;
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
  const { interval } = settings;

  const appointmentDate = format(selectedDate, "yyyy-MM-dd");

  // Parse booked appointments for the selected day
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

  // Function to retrieve the time ranges for a specific day of the week (recurring availability)
  const getTimeRangesForDay = (day: string): TimeRange[] => {
    const recurring = recurringAvailableTimes.find(
      (r) => r.day.toLowerCase() === day
    );
    return recurring
      ? filterTimeRangesByAppointmentType(
          recurring.timeRanges.map((range) => ({
            ...range,
            startTime: new Date(range.startTime), // Parse recurring strings to Date objects
            endTime: new Date(range.endTime), // Parse recurring strings to Date objects
          })),
          appointmentType._id
        )
      : [];
  };

  // Function to get blocked out times
  const getBlockedOutTimesForDate = (date: Date): BlockedTime[] => {
    const blocked = blockedOutTimes.find((b) =>
      isSameDay(new Date(b.startDate), date)
    );
    return blocked ? [blocked] : [];
  };

  // Function to get non-recurring availability for a specific date
  const getNonRecurringAvailableTimesForDate = (
    date: Date
  ): NonRecurringTimeRange[] => {
    const nonRecurring = nonRecurringAvailableTimes.find((s) =>
      isSameDay(new Date(s.date), date)
    );
    return nonRecurring ? nonRecurring.timeRanges : [];
  };

  // Function to generate time intervals between start and end times
  const generateTimeIntervals = (
    start: Date,
    end: Date,
    interval: number,
    selectedDate: Date
  ): Date[] => {
    const times: Date[] = [];
    let current = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      start.getHours(),
      start.getMinutes(),
      0
    );

    const endDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      end.getHours(),
      end.getMinutes(),
      0
    );

    while (isBefore(current, endDate)) {
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

  // Generate all available time slots
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

        return (
          startsWithinBlockedRange ||
          endsWithinBlockedRange ||
          spansBlockedRange ||
          endAdjustedWithinBlockedRange
        );
      })
    );
  });

  // Transform filtered times into time blocks (start and end time)
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
