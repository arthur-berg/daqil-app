import connectToMongoDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import Appointment from "@/models/Appointment";
import User from "@/models/User"; // Assuming you have a User model

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
      const paymentMethodId = paymentIntent.payment_method as string;

      if (appointmentId) {
        try {
          const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
              status: "confirmed",
              "payment.status": "paid",
            }
          );

          const clientId = appointment.participants[0].userId;

          // Update the user with the customer ID and payment method ID if not already stored
          await User.findByIdAndUpdate(clientId, {
            $set: {
              stripePaymentMethodId: paymentMethodId,
            },
          });

          console.log(
            `Appointment ${appointmentId} confirmed and payment marked as paid.`
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
