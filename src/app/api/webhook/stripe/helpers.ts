import Appointment from "@/models/Appointment";
import User from "@/models/User";
import CodeRedemption from "@/models/CodeRedemption";
import Stripe from "stripe";
import { format } from "date-fns";
import {
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const { appointmentId, locale, trackDiscountCodeRedeemed, discountCodeId } =
    paymentIntent.metadata;
  const paymentMethodId = paymentIntent.payment_method as string;

  if (!appointmentId) {
    console.error("No appointment ID in payment metadata.");
    return;
  }

  const appointment = await findAppointmentById(appointmentId);

  if (!appointment) {
    console.error(`Appointment ${appointmentId} not found.`);
    return;
  }

  if (trackDiscountCodeRedeemed && discountCodeId) {
    await redeemDiscountCode(
      appointment.participants[0].userId,
      discountCodeId,
      appointmentId
    );
  }

  const paymentDetails = await getPaymentDetails(paymentIntent);

  await processAppointmentPayment(appointment, paymentDetails, locale);

  await updateUserPaymentMethod(
    appointment.participants[0].userId,
    paymentMethodId
  );
}

async function findAppointmentById(appointmentId: string) {
  try {
    return await Appointment.findById(appointmentId)
      .populate({
        path: "participants.userId",
        select: "firstName lastName email",
      })
      .populate({
        path: "hostUserId",
        select: "firstName lastName email",
      });
  } catch (error) {
    console.error(`Error fetching appointment ${appointmentId}:`, error);
    return null;
  }
}

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

  const appointmentDetails = {
    date: format(new Date(appointment.startDate), "yyyy-MM-dd"),
    time: format(new Date(appointment.startDate), "HH:mm"),
    therapistName: `${await getFullName(
      therapist.firstName,
      therapist.lastName,
      locale
    )}`,
    clientName: `${await getFullName(
      client.firstName,
      client.lastName,
      locale
    )}`,
    durationInMinutes: appointment.durationInMinutes,
    amountPaid: `$${amountPaid}`,
    paymentMethod,
    transactionId,
  };

  await cancelPaymentRelatedJobsForAppointment(appointment._id);

  if (appointment.payment.method === "payBeforeBooking") {
    await handlePayBeforeBooking(appointment, appointmentDetails, locale);
  } else if (appointment.payment.method === "payAfterBooking") {
    await handlePayAfterBooking(appointment, appointmentDetails, locale);
  }
}

async function handlePayBeforeBooking(
  appointment: any,
  appointmentDetails: any,
  locale: string
) {
  const appointmentDate = format(new Date(appointment.startDate), "yyyy-MM-dd");
  await updateAppointments(appointment, appointmentDate);

  // Convert amountPaid to a number (removing the '$' sign and parsing as float)
  const amountPaidNumber = parseFloat(
    appointmentDetails.amountPaid.replace("$", "")
  );

  await Appointment.findByIdAndUpdate(appointment._id, {
    status: "confirmed",
    "payment.status": "paid",
    amountPaid: amountPaidNumber, // Store it as a number
  });

  const t = await getTranslations({
    locale,
    namespace: "PaidBookingConfirmationEmail",
  });

  await sendPaidBookingConfirmationEmail(
    appointmentDetails.therapistName,
    appointmentDetails.clientName,
    appointmentDetails,
    t
  );

  await scheduleReminderJobs(appointment, locale);
  await scheduleStatusUpdateJob(appointment);
}

async function handlePayAfterBooking(
  appointment: any,
  appointmentDetails: any,
  locale: string
) {
  await Appointment.findByIdAndUpdate(appointment._id, {
    "payment.status": "paid",
  });

  await scheduleStatusUpdateJob(appointment);

  const t = await getTranslations({
    locale,
    namespace: "InvoicePaidEmail",
  });

  await sendInvoicePaidEmail(
    appointmentDetails.therapistName,
    appointmentDetails.clientName,
    appointmentDetails,
    t
  );
}

async function updateAppointments(appointment: any, appointmentDate: string) {
  await User.findOneAndUpdate(
    {
      _id: appointment.participants[0].userId,
      "appointments.date": appointmentDate,
    },
    {
      $pull: {
        "appointments.$.temporarilyReservedAppointments": appointment._id,
      },
      $push: { "appointments.$.bookedAppointments": appointment._id },
    }
  );

  await User.findOneAndUpdate(
    {
      _id: appointment.hostUserId,
      "appointments.date": appointmentDate,
    },
    {
      $pull: {
        "appointments.$.temporarilyReservedAppointments": appointment._id,
      },
      $push: { "appointments.$.bookedAppointments": appointment._id },
    }
  );
}

async function updateUserPaymentMethod(
  userId: string,
  paymentMethodId: string
) {
  try {
    await User.findByIdAndUpdate(userId, {
      $set: { stripePaymentMethodId: paymentMethodId },
    });
  } catch (error) {
    console.error(
      `Error updating user payment method for user ${userId}:`,
      error
    );
  }
}
