import connectToMongoDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import Appointment from "@/models/Appointment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

type StripeEventData = {
  object: {
    id: string;
    [key: string]: any;
  };
  [key: string]: any;
};

export async function POST(req: Request): Promise<NextResponse> {
  await connectToMongoDB();
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let data: StripeEventData;
  let eventType: string;
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

  data = event.data as StripeEventData;
  eventType = event.type;

  try {
    if (eventType === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as any;
      const appointmentId = paymentIntent.metadata.appointmentId;

      if (appointmentId) {
        try {
          await Appointment.findByIdAndUpdate(appointmentId, {
            status: "confirmed",
            "payment.status": "paid",
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
