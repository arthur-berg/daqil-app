"use server";
import * as z from "zod";
import { getCurrentRole, requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import { AppointmentSchema, CancelAppointmentSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import mongoose from "mongoose";
import { UserRole } from "@/generalTypes";
import User from "@/models/User";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { scheduleJobToCheckAppointmentStatus } from "@/lib/schedulerJobs";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import {
  sendAppointmentBookingConfirmationEmail,
  sendAppointmentCancellationEmail,
} from "@/lib/mail";

export const getClients = async () => {
  await requireAuth([UserRole.THERAPIST]);

  const clients = await User.find({ role: UserRole.CLIENT }).lean();

  return clients;
};

const checkForOverlappingAppointments = (
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
      return true; // Conflict found
    }
  }
  return false; // No conflict
};

// Function to check therapist availability
const checkTherapistAvailability = async (
  therapist: any,
  startDate: any,
  endDate: any
) => {
  const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

  // Find the specific date entry in the therapist's appointments array
  const appointmentEntry = therapist.appointments.find(
    (appointment: any) => appointment.date === appointmentDate
  );

  // If there are no appointments for that date, the slot is available
  if (!appointmentEntry) {
    return { available: true };
  }

  // Populate the bookedAppointments and temporarilyReservedAppointments fields
  const populatedAppointments = await User.populate(appointmentEntry, {
    path: "bookedAppointments temporarilyReservedAppointments",
    populate: { path: "hostUserId participants.userId" }, // populate further if necessary
  });

  const { bookedAppointments, temporarilyReservedAppointments } =
    populatedAppointments;

  // Check bookedAppointments for overlap
  if (
    checkForOverlappingAppointments(
      bookedAppointments,
      startDate,
      endDate,
      therapist.availableTimes.settings.interval
    )
  ) {
    return { available: false, message: "This time slot is already booked." };
  }

  // Filter valid temporarilyReservedAppointments (those with valid paymentExpiryDate)
  const validTempReservedAppointments = temporarilyReservedAppointments.filter(
    (appointment: any) =>
      new Date(appointment.payment.paymentExpiryDate) > new Date()
  );

  // Check temporarilyReservedAppointments for overlap
  if (
    checkForOverlappingAppointments(
      validTempReservedAppointments,
      startDate,
      endDate,
      therapist.availableTimes.settings.interval
    )
  ) {
    return {
      available: false,
      message: "This time slot is temporarily reserved.",
    };
  }

  return { available: true };
};

const clearTemporarilyReservedAppointments = async (
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
    appointmentEntry.temporarilyReservedAppointments.map(
      (id: string) => new mongoose.Types.ObjectId(id) // Convert to ObjectId
    );

  try {
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
      }
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
      }
    );

    await Appointment.deleteMany({
      _id: { $in: tempReservedAppointmentIds },
      status: "temporarily-reserved",
    });
  } catch (error) {
    console.error(error);
  }
};

const createAppointment = async (appointmentData: any, session: any) => {
  const appointment = await Appointment.create([appointmentData], { session });
  const appointmentItem = appointment[0]; // As appointment.create returns an array

  scheduleJobToCheckAppointmentStatus(
    appointmentItem._id,
    appointmentItem.endDate
  );

  return appointment;
};

const updateAppointments = async (
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

export const cancelAppointment = async (
  values: z.infer<typeof CancelAppointmentSchema>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);

  const validatedFields = CancelAppointmentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const { appointmentId, reason } = validatedFields.data;

  try {
    const user = await requireAuth([
      UserRole.THERAPIST,
      UserRole.ADMIN,
      UserRole.CLIENT,
    ]);

    const { isTherapist, isClient } = await getCurrentRole();

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select: "firstName lastName email",
      })
      .populate("hostUserId", "email firstName lastName");

    if (!appointment) {
      return { error: ErrorMessages("appointmentNotExist") };
    }

    if (appointment.status === "canceled") {
      return { error: ErrorMessages("appointmentAlreadyCanceled") };
    }

    if (appointment.status === "completed") {
      return { error: ErrorMessages("appointmentAlreadyCompleted") };
    }

    if (isTherapist) {
      const isAuthorized =
        user.id === appointment.hostUserId._id.toString() ||
        user.role === UserRole.ADMIN;

      if (!isAuthorized) {
        return { error: ErrorMessages("notAuthorized") };
      }
    }

    if (isClient) {
      const participant = appointment.participants.some(
        (p: any) => p.userId._id.toString() === user.id
      );

      if (!participant) {
        return { error: ErrorMessages("notAuthorized") };
      }
    }

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "canceled",
      cancellationReason: "custom",
      customCancellationReason: reason,
    });

    // Send cancellation emails to both therapist and client
    const therapistEmail = appointment.hostUserId.email;
    const clientEmail = appointment.participants[0].userId.email;
    const appointmentDetails = {
      date: format(appointment.startDate, "yyyy-MM-dd"),
      time: format(appointment.startDate, "HH:mm"),
      reason,
      therapistName: `${appointment.hostUserId.firstName} ${appointment.hostUserId.lastName}`,
      clientName: `${appointment.participants[0].userId.firstName} ${appointment.participants[0].userId.lastName}`,
    };

    await sendAppointmentCancellationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    revalidatePath("/therapist/appointments");

    return { success: SuccessMessages("appointmentCanceled") };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

export const reserveAppointment = async (
  appointmentType: any,
  therapistId: string,
  startDate: Date
) => {
  const [SuccessMessages, ErrorMessages, t] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
    getTranslations("AppointmentAction"),
  ]);
  const client = await requireAuth([UserRole.CLIENT, UserRole.ADMIN]);

  const therapist = (await getUserById(therapistId)) as any;

  if (!therapist) {
    return { error: ErrorMessages("therapistNotExist") };
  }

  if (!appointmentType) {
    return { error: ErrorMessages("appointmentTypeNotExist") };
  }

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  // Clear any temporarily reserved appointments before the transaction
  await clearTemporarilyReservedAppointments(
    client,
    therapist,
    format(new Date(startDate), "yyyy-MM-dd")
  );

  // Check for overlapping appointments before starting the transaction
  const availabilityCheck = await checkTherapistAvailability(
    therapist,
    startDate,
    endDate
  );

  if (!availabilityCheck.available) {
    return { error: availabilityCheck.message };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointmentData = {
      title: `${t("therapySessionWith")} ${therapist?.firstName}`,
      startDate,
      endDate,
      participants: [{ userId: client.id, showUp: false }],
      hostUserId: therapistId,
      durationInMinutes: appointmentType.durationInMinutes,
      payment: {
        method: "checkout",
        status: "pending",
        paymentExpiryDate: new Date(Date.now() + 15 * 60000),
      },
      status: "temporarily-reserved",
      credits: appointmentType.credits,
      price: appointmentType.price,
      currency: appointmentType.currency,
    };

    const appointment = await createAppointment(appointmentData, session);
    const appointmentId = appointment[0]._id;
    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    if (
      client.selectedTherapist &&
      client.selectedTherapist.toString() !== therapistId
    ) {
      // Update the previous therapist in selectedTherapistHistory
      await User.updateOne(
        { _id: client.id, "selectedTherapistHistory.current": true },
        {
          $set: {
            "selectedTherapistHistory.$.current": false,
            "selectedTherapistHistory.$.endDate": new Date(),
          },
        },
        { session }
      );

      // Add new therapist to selectedTherapistHistory
      await User.findByIdAndUpdate(
        client.id,
        {
          selectedTherapist: therapistId,
          $push: {
            selectedTherapistHistory: {
              therapist: therapistId,
              startDate: new Date(),
              current: true,
            },
          },
        },
        { session }
      );

      // Remove client from old therapist's assignedClients list
      await User.findByIdAndUpdate(
        client.selectedTherapist,
        { $pull: { assignedClients: client.id } },
        { session }
      );
    }

    // Add client to new therapist's assignedClients list if not already present
    if (!therapist.assignedClients.includes(client.id)) {
      await User.findByIdAndUpdate(
        therapistId,
        { $addToSet: { assignedClients: client.id } }, // $addToSet ensures no duplicates
        { session }
      );
    }

    // Update the user's appointments
    await updateAppointments(
      client.id,
      appointmentDate,
      appointmentId,
      session,
      "temporarilyReservedAppointments"
    );

    // Update the therapist's appointments
    await updateAppointments(
      therapistId,
      appointmentDate,
      appointmentId,
      session,
      "temporarilyReservedAppointments"
    );

    await session.commitTransaction();
    session.endSession();

    const therapistEmail = therapist.email;
    const clientEmail = client.email;
    const appointmentDetails = {
      date: format(startDate, "yyyy-MM-dd"),
      time: format(startDate, "HH:mm"),
      therapistName: `${therapist.firstName} ${therapist.lastName}`,
      clientName: `${client.firstName} ${client.lastName}`,
    };

    await sendAppointmentBookingConfirmationEmail(
      therapistEmail,
      clientEmail,
      appointmentDetails
    );

    revalidatePath("/client/appointments");

    return {
      success: SuccessMessages("appointmentReserved"),
      appointmentId: appointmentId,
      paymentExpiryDate: appointment[0].payment.paymentExpiryDate,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error booking appointment:", error);
    throw error;
  }
};

export const scheduleAppointment = async (
  values: z.input<typeof AppointmentSchema>
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const therapist = await requireAuth([UserRole.THERAPIST]);

  const validatedFields = AppointmentSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: ErrorMessages("invalidFields") };
  }

  const {
    title,
    description,
    startDate,
    paid,
    status,
    clientId,
    appointmentTypeId,
  } = validatedFields.data;

  const appointmentType = await getAppointmentTypeById(appointmentTypeId);

  const client = await User.findById(clientId);

  if (!appointmentType) {
    return { error: ErrorMessages("appointmentTypeNotExist") };
  }

  let appointmentCost: Record<string, unknown> = {};

  if ("price" in appointmentType) {
    appointmentCost.price = appointmentType.price;
    appointmentCost.currency = appointmentType.currency;
  }
  if ("credits" in appointmentType) {
    appointmentCost.credits = appointmentType.credits;
  }

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.create(
      [
        {
          title,
          description,
          startDate,
          endDate,
          payment: {
            method: "link",
            status: "pending",
          },
          status: "confirmed",
          participants: [{ userId: clientId, showUp: false }],
          hostUserId: therapist.id,
          durationInMinutes: appointmentType.durationInMinutes,
          ...appointmentCost,
        },
      ],
      { session }
    );

    const appointmentId = appointment[0]._id;

    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    // Check and update client's selected therapist

    if (
      client.selectedTherapist &&
      client.selectedTherapist.toString() !== therapist.id
    ) {
      // Update the previous therapist in selectedTherapistHistory
      await User.updateOne(
        { _id: clientId, "selectedTherapistHistory.current": true },
        {
          $set: {
            "selectedTherapistHistory.$.current": false,
            "selectedTherapistHistory.$.endDate": new Date(),
          },
        },
        { session }
      );

      // Remove client from old therapist's assignedClients list
      await User.findByIdAndUpdate(
        client.selectedTherapist,
        { $pull: { assignedClients: client.id } },
        { session }
      );

      // Add new therapist to selectedTherapistHistory
      await User.findByIdAndUpdate(
        clientId,
        {
          selectedTherapist: therapist.id,
          $push: {
            selectedTherapistHistory: {
              therapist: therapist.id,
              startDate: new Date(),
              current: true,
            },
          },
        },
        { session }
      );
    }

    // Add client to new therapist's assignedClients list if not already present
    if (!therapist?.assignedClients?.includes(clientId)) {
      await User.findByIdAndUpdate(
        therapist.id,
        { $addToSet: { assignedClients: clientId } }, // $addToSet ensures no duplicates
        { session }
      );
    }

    // Update the clients appointments
    await updateAppointments(
      clientId,
      appointmentDate,
      appointmentId,
      session,
      "bookedAppointments"
    );

    // Update the therapist's appointments
    await updateAppointments(
      therapist.id,
      appointmentDate,
      appointmentId,
      session,
      "bookedAppointments"
    );

    await session.commitTransaction();
    session.endSession();

    return { success: SuccessMessages("appointmentCreated") };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error booking appointment:", error);
    throw error;
  }
};
