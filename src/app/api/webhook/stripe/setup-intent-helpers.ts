import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { Stripe } from "stripe";
import { format } from "date-fns";
import {
  addTagToMailchimpUser,
  sendIntroBookingConfirmationMail,
  sendPaidBookingConfirmationEmail,
} from "@/lib/mail";
import {
  cancelPaymentRelatedJobsForAppointment,
  scheduleReminderJobs,
  scheduleStatusUpdateJob,
} from "@/lib/schedule-appointment-jobs";
import { getTranslations } from "next-intl/server";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import {
  findAppointmentById,
  updateAppointments,
  updateUserPaymentMethod,
} from "./helpers";
import { getFullName } from "@/utils/nameUtilsForApiRoutes";

export async function handleSetupIntentSucceeded(
  setupIntent: Stripe.SetupIntent
) {
  const metadata = setupIntent.metadata;

  if (!metadata || !metadata.appointmentId || !metadata.locale) {
    console.error("Invalid or missing metadata in setup intent.");
    return;
  }

  const { appointmentId, locale } = metadata;

  const paymentMethodId = setupIntent.payment_method as string;

  if (!appointmentId) {
    console.error("No appointment ID in setup intent metadata.");
    return;
  }

  // Fetch the appointment to get all relevant details
  const appointment = await findAppointmentById(appointmentId);

  if (!appointment) {
    console.error(`Appointment ${appointmentId} not found.`);
    return;
  }

  const userId = appointment.participants[0].userId._id.toString();

  if (userId && paymentMethodId) {
    await updateUserPaymentMethod(userId, paymentMethodId);

    // Proceed to update appointment status, send emails, and schedule jobs

    const appointmentDate = formatInTimeZone(
      new Date(appointment.startDate),
      "UTC",
      "yyyy-MM-dd"
    );

    await updateAppointments(appointment, appointmentDate);

    // Update the appointment status to "confirmed"
    await Appointment.findByIdAndUpdate(appointment._id, {
      status: "confirmed",
      "payment.status": "paid",
    });

    // Email and reminder logic
    const client = appointment.participants[0].userId;
    const therapist = appointment.hostUserId;
    const clientEmail = client.email;
    const therapistEmail = therapist.email;

    const clientTimeZone = client.settings.timeZone || "UTC";
    const therapistTimeZone = therapist.settings.timeZone || "UTC";

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

    const appointmentDetails: any = {
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
      therapistTimeZone,
      clientTimeZone,
    };

    const t = await getTranslations({
      locale,
      namespace: "BookingConfirmedIntroCall",
    });

    await User.findByIdAndUpdate(client.id, {
      $set: {
        "selectedTherapist.therapist": therapist._id,
      },
    });

    await addTagToMailchimpUser(clientEmail, "intro-call-booked-card");

    await sendIntroBookingConfirmationMail(
      therapistEmail,
      clientEmail,
      appointmentDetails,
      t,
      locale
    );

    revalidatePath(`/book-appointment`);
    revalidatePath(`/appointments`);
    await cancelPaymentRelatedJobsForAppointment(appointment._id);
    await scheduleReminderJobs(appointment, locale);
    await scheduleStatusUpdateJob(appointment);
  } else {
    console.error("Missing userId or paymentMethodId for setup intent.");
  }
}
