import Appointment from "@/models/Appointment";
import User from "@/models/User";
import CodeRedemption from "@/models/CodeRedemption";
import Stripe from "stripe";
import { format } from "date-fns";
import {
  addTagToMailchimpUser,
  sendInvoicePaidEmail,
  sendPaidBookingConfirmationEmail,
} from "@/lib/mail";
import {
  cancelPaymentRelatedJobsForAppointment,
  scheduleReminderJobs,
  scheduleStatusUpdateJob,
} from "@/lib/schedule-appointment-jobs";
import { getTranslations } from "next-intl/server";
import { getFullName } from "@/utils/nameUtilsForApiRoutes";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const { appointmentId, locale, trackDiscountCodeRedeemed, discountCodeId } =
    paymentIntent.metadata;
  const paymentMethodId = paymentIntent.payment_method as string;

  if (!appointmentId) {
    console.error(
      "No appointment ID in payment metadata in handlePaymentIntentSucceeded. Probably because intent was created by charging user for missed intro call"
    );
    return;
  }

  const appointment = await findAppointmentById(appointmentId);

  if (!appointment) {
    console.error(`Appointment ${appointmentId} not found.`);
    return;
  }

  const userId = appointment.participants[0].userId._id.toString();

  if (trackDiscountCodeRedeemed && discountCodeId) {
    await redeemDiscountCode(userId, discountCodeId, appointmentId);
  }

  const paymentDetails = await getPaymentDetails(paymentIntent);

  await processAppointmentPayment(appointment, paymentDetails, locale);

  const user = await updateUserPaymentMethod(userId, paymentMethodId);

  if (!user.stripePaymentMethodId) {
    await addTagToMailchimpUser(user.email, "has-paid-for-appointment");
  }
}

export const findAppointmentById = async (appointmentId: string) => {
  try {
    return await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select: "firstName lastName email settings.timeZone",
      })
      .populate({
        path: "hostUserId",
        select: "firstName lastName email settings.timeZone",
      });
  } catch (error) {
    console.error(`Error fetching appointment ${appointmentId}:`, error);
    return null;
  }
};

async function redeemDiscountCode(
  userId: string,
  discountCodeId: string,
  appointmentId: string
) {
  try {
    await CodeRedemption.create({ userId, discountCodeId, appointmentId });
  } catch (error) {
    console.error(
      `Error redeeming discount code for appointment ${appointmentId}:`,
      error
    );
  }
}

async function getPaymentDetails(paymentIntent: Stripe.PaymentIntent) {
  const amountPaid = (paymentIntent.amount_received / 100).toFixed(2);
  const charge = paymentIntent.latest_charge
    ? await stripe.charges.retrieve(paymentIntent.latest_charge as string)
    : null;
  return {
    amountPaid,
    paymentMethod: charge?.payment_method_details?.type || "Unknown",
    transactionId: charge?.id || "Unknown",
  };
}

async function processAppointmentPayment(
  appointment: any,
  paymentDetails: any,
  locale: string
) {
  const { amountPaid, paymentMethod, transactionId } = paymentDetails;
  const client = appointment.participants[0].userId;
  const therapist = appointment.hostUserId;
  const clientTimeZone = client.settings.timeZone || "UTC";
  const therapistTimeZone = therapist.settings.timeZone || "UTC";

  const clientEmail = client.email;
  const therapistEmail = therapist.email;

  const therapistAppointmentDate = formatInTimeZone(
    new Date(appointment.startDate),
    therapistTimeZone,
    "yyyy-MM-dd"
  );

  const therapistAppointmentTime = formatInTimeZone(
    new Date(appointment.startDate),
    therapistTimeZone,
    "HH:mm"
  );

  const clientAppointmentDate = formatInTimeZone(
    new Date(appointment.startDate),
    clientTimeZone,
    "yyyy-MM-dd"
  );
  const clientAppointmentTime = formatInTimeZone(
    new Date(appointment.startDate),
    clientTimeZone,
    "HH:mm"
  );

  const appointmentDetails = {
    clientDate: clientAppointmentDate,
    clientTime: clientAppointmentTime,
    therapistDate: therapistAppointmentDate,
    therapistTime: therapistAppointmentTime,
    therapistName: `${getFullName(
      therapist.firstName,
      therapist.lastName,
      locale
    )}`,
    clientName: `${getFullName(client.firstName, client.lastName, locale)}`,
    durationInMinutes: appointment.durationInMinutes,
    amountPaid: `$${amountPaid}`,
    paymentMethod,
    transactionId,
    therapistTimeZone,
    clientTimeZone,
  };

  await cancelPaymentRelatedJobsForAppointment(appointment._id);

  if (appointment.payment.method === "payBeforeBooking") {
    await handlePayBeforeBooking(
      appointment,
      appointmentDetails,
      locale,
      therapistEmail,
      clientEmail
    );
  } else if (appointment.payment.method === "payAfterBooking") {
    await handlePayAfterBooking(
      appointment,
      appointmentDetails,
      locale,
      therapistEmail,
      clientEmail
    );
  }
}

async function handlePayBeforeBooking(
  appointment: any,
  appointmentDetails: any,
  locale: string,
  therapistEmail: string,
  clientEmail: string
) {
  const appointmentDate = formatInTimeZone(
    new Date(appointment.startDate),
    "UTC",
    "yyyy-MM-dd"
  );
  await updateAppointments(appointment, appointmentDate);

  // Convert amountPaid to a number (removing the '$' sign and parsing as float)
  const amountPaidNumber = parseFloat(
    appointmentDetails.amountPaid.replace("$", "")
  );

  await Appointment.findByIdAndUpdate(appointment._id, {
    status: "confirmed",
    "payment.status": "paid",
    amountPaid: amountPaidNumber,
  });

  const t = await getTranslations({
    locale,
    namespace: "PaidBookingConfirmationEmail",
  });

  await sendPaidBookingConfirmationEmail(
    therapistEmail,
    clientEmail,
    appointmentDetails,
    t,
    locale
  );
  revalidatePath(`/book-appointment`);
  revalidatePath(`/appointments`);
  await scheduleReminderJobs(appointment, locale);
  await scheduleStatusUpdateJob(appointment);
}

async function handlePayAfterBooking(
  appointment: any,
  appointmentDetails: any,
  locale: string,
  therapistEmail: string,
  clientEmail: string
) {
  await Appointment.findByIdAndUpdate(appointment._id, {
    "payment.status": "paid",
  });

  revalidatePath(`/book-appointment`);
  revalidatePath(`/appointments`);
  await scheduleReminderJobs(appointment, locale);
  await scheduleStatusUpdateJob(appointment);

  const t = await getTranslations({
    locale,
    namespace: "InvoicePaidEmail",
  });

  await sendInvoicePaidEmail(
    therapistEmail,
    clientEmail,
    appointmentDetails,
    t,
    locale
  );
}

export const updateSelectedTherapist = async () => {};

export const updateAppointments = async (
  appointment: any,
  appointmentDate: string
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const clientId = appointment.participants[0].userId;
    const therapistId = appointment.hostUserId;

    const client = await User.findOneAndUpdate(
      {
        _id: clientId,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": appointment._id,
        },
        $addToSet: { "appointments.$.bookedAppointments": appointment._id },
      },
      { session }
    );

    const therapist = await User.findOneAndUpdate(
      {
        _id: therapistId,
        "appointments.date": appointmentDate,
      },
      {
        $pull: {
          "appointments.$.temporarilyReservedAppointments": appointment._id,
        },
        $addToSet: { "appointments.$.bookedAppointments": appointment._id },
      },
      { session }
    );

    /*  const isIntroCall =
      appointment.appointmentTypeId.toString() ===
      APPOINTMENT_TYPE_ID_INTRO_SESSION; */

    const currentTherapist = client.selectedTherapistHistory.find(
      (therapistObj: any) => {
        return therapistObj.current;
      }
    );

    if (
      !currentTherapist ||
      currentTherapist?.therapist.toString() !== therapistId.toString() /* &&
      !isIntroCall */
    ) {
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

      await User.findByIdAndUpdate(
        clientId,
        {
          $set: {
            "selectedTherapist.therapist": therapistId,
          },
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

      await User.findByIdAndUpdate(
        client.selectedTherapist?.therapist,
        { $pull: { assignedClients: clientId } },
        { session }
      );
    }

    if (!therapist.assignedClients?.includes(clientId)) {
      await User.findByIdAndUpdate(
        therapistId,
        { $addToSet: { assignedClients: clientId } },
        { session }
      );
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateUserPaymentMethod = async (
  userId: string,
  paymentMethodId: string
) => {
  try {
    const user = await User.findByIdAndUpdate(userId, {
      $set: { stripePaymentMethodId: paymentMethodId },
    });
    return user;
  } catch (error) {
    console.error(
      `Error updating user payment method for user ${userId}:`,
      error
    );
  }
};
