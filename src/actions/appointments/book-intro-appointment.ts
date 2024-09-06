"use server";

import { getFirstName } from "./../../utils/formatName";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getTherapistById } from "@/data/user";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { format } from "date-fns";
import mongoose from "mongoose";
import { getTranslations } from "next-intl/server";
import { updateAppointments } from "./utils";
import { revalidatePath } from "next/cache";
import connectToMongoDB from "@/lib/mongoose";

export const bookIntroAppointment = async (
  appointmentType: any,
  therapistId: string,
  startDate: Date
) => {
  await connectToMongoDB();

  const [SuccessMessages, ErrorMessages, t] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
    getTranslations("AppointmentAction"),
  ]);

  const therapist = (await getTherapistById(therapistId)) as any;

  if (!therapist) {
    return { error: ErrorMessages("therapistNotExist") };
  }

  const isFree = appointmentType._id === APPOINTMENT_TYPE_ID_INTRO_SESSION;

  if (!isFree) {
    return { error: ErrorMessages("invalidFields") };
  }

  let transactionCommitted = false;

  const session = await mongoose.startSession();
  session.startTransaction();

  const endDate = new Date(
    startDate.getTime() + appointmentType.durationInMinutes * 60000
  );

  try {
    const client = await requireAuth([UserRole.CLIENT]);

    const appointmentData = {
      title: `${t("therapySessionWith")} ${await getFirstName(
        therapist?.firstName
      )}`,
      startDate,
      endDate,
      participants: [{ userId: client.id, showUp: false }],
      appointmentTypeId: appointmentType._id,
      hostUserId: therapistId,
      durationInMinutes: appointmentType.durationInMinutes,
      payment: {
        method: "payBeforeBooking",
        status: "paid",
      },
      status: "confirmed",
      price: appointmentType.price,
      currency: appointmentType.currency,
    };

    const appointment = await Appointment.create([appointmentData], {
      session,
    });

    if (!appointment) {
      throw new Error("Failed to create appointment.");
    }

    const appointmentId = appointment[0]._id;
    const appointmentDate = format(new Date(startDate), "yyyy-MM-dd");

    // Check and update client's selected therapist

    await User.findByIdAndUpdate(
      client.id,
      {
        $set: {
          "selectedTherapist.therapist": therapist.id,
        },
      },
      { session }
    );

    // Update the clients appointments
    await updateAppointments(
      client.id,
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
    transactionCommitted = true;
    session.endSession();

    revalidatePath("/appointments");
    revalidatePath("/book-appointment");

    return {
      success: SuccessMessages("bookingConfirmed"),
    };
  } catch (error) {
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Error in cancelTempReservation:", error);
    return { error: ErrorMessages("somethingWentWrong") };
  }
};
