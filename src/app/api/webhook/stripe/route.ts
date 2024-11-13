import connectToMongoDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { handlePaymentIntentSucceeded } from "./helpers";
import { handleSetupIntentSucceeded } from "./setup-intent-helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request): Promise<NextResponse> {
  await connectToMongoDB();
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const data = event.data.object as Stripe.PaymentIntent;
  const eventType = event.type;

  if (eventType === "payment_intent.succeeded") {
    await handlePaymentIntentSucceeded(data);
  }

  if (event.type === "setup_intent.succeeded") {
    const setupIntent = event.data.object as Stripe.SetupIntent;
    await handleSetupIntentSucceeded(setupIntent);
  }

  return NextResponse.json({});
}
