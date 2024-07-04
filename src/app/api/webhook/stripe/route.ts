import connectToMongoDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import User from "@/models/User";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// Define a type for Stripe event data
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

  // Verify Stripe event
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
    if (eventType === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(data.object.id, {
        expand: ["line_items"],
      });

      let customerId = session.customer as string | null;
      let customer: Stripe.Customer | null = null;
      let email: string | null = null;
      let name: string | null = null;

      if (!customerId && data.object.mode === "payment") {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );
        customerId = paymentIntent.customer as string | null;

        if (!customerId) {
          const newCustomer = await stripe.customers.create({
            email: session.customer_details?.email || undefined,
            name: session.customer_details?.name || undefined,
          });
          customerId = newCustomer.id;
          customer = newCustomer;
        }
      }

      if (customerId) {
        customer =
          customer ||
          ((await stripe.customers.retrieve(customerId)) as Stripe.Customer);
        email = customer.email || null;
        name = customer.name || null;
      } else if (session.customer_details) {
        email = session.customer_details.email;
        name = session.customer_details.name;
      }

      if (!email) {
        return NextResponse.json(
          { error: "No customer email found" },
          { status: 400 }
        );
      }

      const priceId = session.line_items?.data[0]?.price?.id;
      const user = await User.findOne({ email: customer?.email });

      if (!user) {
        await User.create({
          email: customer?.email,
          name: customer?.name,
          stripeCustomerId: customerId,
        });
      }

      await User.updateOne(
        { email: customer?.email },
        {
          priceId,
          hasAccess: true,
          stripeCustomerId: customerId,
        }
      );

      // Extra: Send email to dashboard
    }

    if (eventType === "customer.subscription.deleted") {
      const subscription = await stripe.subscriptions.retrieve(data.object.id);

      await User.findOneAndUpdate(
        {
          stripeCustomerId: subscription.customer as string,
        },
        {
          hasAccess: false,
        }
      );
    }

    // more cases
    //
    // checkout.session.expired
    // Can be user if user doesn't finish their purchase and u want to send reminder to finalize purchases

    // customer.subscription.updated
    //
    // invoice.payment_failed
    // If you want to terminate subscription immeditaly after payment failed, otherwise by default it waits until end of billing cycle
    //
    // invoice.paid
    // if you are using the invoice.payment_failed event to revoke access, you can use this event to grant access back
  } catch (e: any) {
    console.error("stripe error: " + e.message + " | EVENT TYPE: " + eventType);
  }

  return NextResponse.json({});
}
