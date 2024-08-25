import connectToMongoDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { format } from "date-fns";
import {
  sendInvoicePaidEmail,
  sendPaidBookingConfirmationEmail,
} from "@/lib/mail";
import CodeRedemption from "@/models/CodeRedemption";
import {
  cancelPaymentRelatedJobsForAppointment,
  scheduleAppointmentJobs,
  scheduleCancelUnpaidJobs,
} from "@/lib/schedule-appointment-jobs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request): Promise<NextResponse> {
  await connectToMongoDB();
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event: Stripe.Event;

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const data = event.data.object as Stripe.PaymentIntent;
  const eventType = event.type;

  try {
    if (eventType === "payment_intent.succeeded") {
      const paymentIntent = data;
      const appointmentId = paymentIntent.metadata.appointmentId;
      const trackDiscountCodeRedeemed =
        paymentIntent.metadata.trackDiscountCodeRedeemed;
      const discountCodeId = paymentIntent.metadata.discountCodeId;

      const paymentMethodId = paymentIntent.payment_method as string;

      if (appointmentId) {
        try {
          const appointment = await Appointment.findById(appointmentId)
            .populate({
              path: "participants.userId",
              select: "firstName lastName email",
            })
            .populate({
              path: "hostUserId",
              select: "firstName lastName email",
            });

          if (!appointment) {
            console.error(`Appointment ${appointmentId} not found.`);
            return NextResponse.json(
              { error: "Appointment not found" },
              { status: 404 }
            );
          }

          if (trackDiscountCodeRedeemed && discountCodeId) {
            await CodeRedemption.create({
              userId: appointment.participants[0].userId,
              discountCodeId: discountCodeId,
              appointmentId: appointmentId,
            });
          }

          // Retrieve payment details from the Stripe PaymentIntent
          const amountPaid = (paymentIntent.amount_received / 100).toFixed(2); // Convert from cents to dollars
          const charge = paymentIntent.latest_charge
            ? await stripe.charges.retrieve(
                paymentIntent.latest_charge as string
              )
            : null;
          const paymentMethod =
            charge?.payment_method_details?.type || "Unknown";
          const transactionId = charge?.id || "Unknown";

          const client = appointment.participants[0].userId;
          const therapist = appointment.hostUserId;

          const clientEmail = client.email;
          const therapistEmail = therapist.email;

          const appointmentDetails = {
            date: format(new Date(appointment.startDate), "yyyy-MM-dd"),
            time: format(new Date(appointment.startDate), "HH:mm"),
            therapistName: `${therapist.firstName} ${therapist.lastName}`,
            clientName: `${client.firstName} ${client.lastName}`,
            durationInMinutes: appointment.durationInMinutes,
            amountPaid: `$${amountPaid}`,
            paymentMethod: paymentMethod,
            transactionId: transactionId,
          };

          await cancelPaymentRelatedJobsForAppointment(appointmentId);

          // Check payment type
          if (appointment.payment.method === "payBeforeBooking") {
            // Move appointment from temporarilyReservedAppointments to bookedAppointments
            const appointmentDate = format(
              new Date(appointment.startDate),
              "yyyy-MM-dd"
            );

            // Update the user's appointments
            await User.findOneAndUpdate(
              {
                _id: appointment.participants[0].userId,
                "appointments.date": appointmentDate,
              },
              {
                $pull: {
                  "appointments.$.temporarilyReservedAppointments":
                    appointmentId,
                },
                $push: {
                  "appointments.$.bookedAppointments": appointmentId,
                },
              }
            );

            // Update the therapist's appointments
            await User.findOneAndUpdate(
              {
                _id: appointment.hostUserId,
                "appointments.date": appointmentDate,
              },
              {
                $pull: {
                  "appointments.$.temporarilyReservedAppointments":
                    appointmentId,
                },
                $push: {
                  "appointments.$.bookedAppointments": appointmentId,
                },
              }
            );

            // Mark the appointment as confirmed and payment as paid
            await Appointment.findByIdAndUpdate(appointmentId, {
              status: "confirmed",
              "payment.status": "paid",
              amountPaid: amountPaid,
            });

            await sendPaidBookingConfirmationEmail(
              therapistEmail,
              clientEmail,
              appointmentDetails
            );

            await scheduleAppointmentJobs(appointment);
          } else if (appointment.payment.method === "payAfterBooking") {
            await Appointment.findByIdAndUpdate(appointmentId, {
              "payment.status": "paid",
            });

            await sendInvoicePaidEmail(
              therapistEmail,
              clientEmail,
              appointmentDetails
            );
          }

          // Update the user with the payment method ID if not already stored
          await User.findByIdAndUpdate(appointment.participants[0].userId, {
            $set: {
              stripePaymentMethodId: paymentMethodId,
            },
          });

          console.log(
            `Appointment ${appointmentId} processed successfully and payment marked as paid.`
          );
        } catch (error) {
          console.error(
            `Failed to update appointment ${appointmentId}: ${error}`
          );
        }
      }
    }
  } catch (e: any) {
    console.error("stripe error: " + e.message + " | EVENT TYPE: " + eventType);
  }

  return NextResponse.json({});
}
