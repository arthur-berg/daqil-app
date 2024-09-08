import {
  cancelAllScheduledJobsForAppointment,
  schedulePayBeforePaymentExpiredStatusUpdateJobs,
} from "@/lib/schedule-appointment-jobs";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { getTherapistAvailableTimeSlots } from "@/utils/therapistAvailability";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { startSession } from "mongoose";
import { getLocale } from "next-intl/server";

const removeRelatedJobs = async (appointmentIds: any) => {
  for (const appointmentId of appointmentIds) {
    await cancelAllScheduledJobsForAppointment(appointmentId);
  }
};

export const createAppointment = async (appointmentData: any, session: any) => {
  const locale = await getLocale();
  const appointment = await Appointment.create([appointmentData], { session });

  if (!appointment) {
    throw new Error("Failed to create appointment.");
  }

  await schedulePayBeforePaymentExpiredStatusUpdateJobs(
    appointment[0]._id.toString(),
    appointment[0].payment.paymentExpiryDate,
    locale
  );

  return appointment;
};

export const updateAppointments = async (
  userId: string,
  appointmentDate: string,
  appointmentId: string,
  session: any,
  appointmentCategory: "bookedAppointments" | "temporarilyReservedAppointments"
) => {
  // First, check if the date entry exists
  const user = await User.findOne(
    {
      _id: userId,
      "appointments.date": appointmentDate,
    },
    null, // Projection, keep it null
    { session }
  );

  if (user) {
    // If the date exists, update the specified appointment category array
    await User.findOneAndUpdate(
      {
        _id: userId,
        "appointments.date": appointmentDate, // Match the specific date
      },
      {
        $push: {
          [`appointments.$.${appointmentCategory}`]: appointmentId, // Dynamically push to the specified array for that date
        },
      },
      { session }
    );
  } else {
    // If the date doesn't exist, add a new date entry with the appointmentId in the specified category
    await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $push: {
          appointments: {
            date: appointmentDate,
            [appointmentCategory]: [appointmentId], // Dynamically create the array for the specified category
          },
        },
      },
      { session }
    );
  }
};

export const checkForOverlappingAppointments = (
  appointments: any,
  startDate: any,
  endDate: any,
  interval = 15
) => {
  const intervalInMilliseconds = interval * 60000;
  const startWithBuffer = new Date(
    startDate.getTime() - intervalInMilliseconds
  );
  const endWithBuffer = new Date(endDate.getTime() + intervalInMilliseconds);

  for (const appointment of appointments) {
    const appointmentStart = new Date(appointment.startDate);
    const appointmentEnd = new Date(appointment.endDate);

    if (
      (startWithBuffer < appointmentEnd && endWithBuffer > appointmentStart) ||
      (startWithBuffer <= appointmentStart && endWithBuffer >= appointmentEnd)
    ) {
      return true;
    }
  }
  return false;
};

export const checkTherapistAvailability = async (
  therapist: any,
  startDate: any,
  endDate: any,
  appointmentType: any
) => {
  const validTimeSlots = getTherapistAvailableTimeSlots(
    therapist.availableTimes,
    appointmentType,
    startDate,
    therapist.appointments
  );

  const requestedStart = new Date(startDate);
  const requestedEnd = new Date(endDate);

  const isSlotAvailable = validTimeSlots.some((slot) => {
    return (
      (isEqual(slot.start, requestedStart) ||
        isBefore(slot.start, requestedStart)) &&
      (isEqual(slot.end, requestedEnd) || isAfter(slot.end, requestedEnd))
    );
  });

  if (!isSlotAvailable) {
    return {
      available: false,
      message: "This time slot is already booked or blocked.",
    };
  }

  return { available: true };
};

export const clearTemporarilyReservedAppointments = async (
  client: any,
  therapist: any,
  appointmentDate: string
) => {
  const appointmentEntry = client.appointments.find(
    (appointment: any) => appointment.date === appointmentDate
  );

  if (
    !appointmentEntry ||
    !appointmentEntry.temporarilyReservedAppointments?.length
  ) {
    console.log("No temporarily reserved appointments to clear.");
    return;
  }

  const tempReservedAppointmentIds =
    appointmentEntry.temporarilyReservedAppointments;

  const session = await startSession();
  session.startTransaction();

  try {
    await removeRelatedJobs(tempReservedAppointmentIds);

    await User.updateOne(
      {
        _id: client.id,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": {
            $in: tempReservedAppointmentIds,
          },
        },
      },
      { session }
    );

    await User.updateOne(
      {
        _id: therapist.id,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": {
            $in: tempReservedAppointmentIds,
          },
        },
      },
      { session }
    );

    await Appointment.deleteMany(
      {
        _id: { $in: tempReservedAppointmentIds },
        status: "temporarily-reserved",
      },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    console.error(error);
  }
};
